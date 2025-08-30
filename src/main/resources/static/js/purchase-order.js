import { supabase } from "./supabase-client.js";

const poTableBody = document.getElementById("poTableBody");

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    alert("Please log in as Admin first.");
    window.location.href = "/html/login.html";
    return null;
  }
  return data.user;
}

async function loadPurchaseOrders() {
  const user = await getCurrentUser();
  if (!user) return;

  const supabaseUserId = user.id;

  try {
    //  Fetch items (with imports)
    const res = await fetch(`/api/items/admin/${supabaseUserId}`);
    if (!res.ok) throw new Error("Failed to fetch items");
    const items = await res.json();

    poTableBody.innerHTML = "";

    items.forEach((item, idx) => {
      if (item.quantity <= 10) {
        const imports = item.imports || [];
        const latestImport = imports.length
          ? imports[imports.length - 1]
          : null;

        const vendorName = latestImport?.vendorName || "Unknown";
        const vendorId = latestImport?.vendorEntityId || "-";
        const vendorEmail = latestImport?.vendorEmail || "no-vendor@email.com";

        // Random reorder qty 11–30
        const reorderQty = Math.floor(Math.random() * (30 - 11 + 1)) + 11;
        const amount = reorderQty * item.price;

        const row = document.createElement("tr");
        row.innerHTML = `
          <td data-label="PO ID">#PO-${idx + 1001}</td>
          <td data-label="Item">${item.name}</td>
          <td data-label="Supplier">${vendorName} (${vendorId})</td>
          <td data-label="Items">${reorderQty}</td>
          <td data-label="Amount">₹${amount}</td>
          <td data-label="Status" class="status-pending">Pending</td>
          <td data-label="Action" class="actions">
            <button class="view-btn">View</button>
            <button class="approve-btn"
              data-id="${idx + 1001}"
              data-vendorname="${vendorName}"
              data-vendoremail="${vendorEmail}"
              data-itemname="${item.name}"
              data-quantity="${reorderQty}"
              data-amount="${amount}"
            >Approve</button>
            <button class="reject-btn">Reject</button>
          </td>
        `;
        poTableBody.appendChild(row);
      }
    });

    //  Approve button
    document.querySelectorAll(".approve-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const poId = e.target.dataset.id;
        const vendorName = e.target.dataset.vendorname;
        const vendorEmail = e.target.dataset.vendoremail;
        const itemName = e.target.dataset.itemname;
        const quantity = e.target.dataset.quantity;
        const amount = e.target.dataset.amount;

        try {
          const res = await fetch(
            `/api/purchase-orders/${poId}/approve?` +
              new URLSearchParams({
                adminEmail: user.email,
                vendorEmail,
                vendorName,
                itemName,
                quantity,
                amount,
              }),
            { method: "POST" }
          );

          if (!res.ok) throw new Error("Approval request failed");

          const msg = await res.text();
          alert(msg);

          //  Update row to Approved
          const row = e.target.closest("tr");
          const statusCell = row.querySelector("[data-label='Status']");
          statusCell.textContent = "Approved";
          statusCell.className = "status-approved";

          // Remove buttons except View
          const actionCell = row.querySelector("[data-label='Action']");
          actionCell.innerHTML = `<button class="view-btn">View</button>`;
        } catch (err) {
          console.error("Error approving PO:", err.message);
          alert(" Failed to approve purchase order.");
        }
      });
    });

    //  Reject button
    document.querySelectorAll(".reject-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const row = e.target.closest("tr");

        // Update status
        const statusCell = row.querySelector("[data-label='Status']");
        statusCell.textContent = "Rejected";
        statusCell.className = "status-rejected";

        // // Clear action buttons
        // const actionCell = row.querySelector("[data-label='Action']");
        // actionCell.innerHTML = `<button class="view-btn">View</button>`;
      });
    });
  } catch (err) {
    console.error("Error loading purchase orders:", err.message);
    poTableBody.innerHTML = `<tr><td colspan="7"> Failed to load purchase orders.</td></tr>`;
  }
}

document.addEventListener("DOMContentLoaded", loadPurchaseOrders);
