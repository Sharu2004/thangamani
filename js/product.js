// ================= TOTAL CALCULATION =================
let qtyInputs = document.querySelectorAll(".qty");

qtyInputs.forEach(input => {
    input.addEventListener("input", () => {
        if (input.value === "") input.value = 0;
        calculateTotal();
    });
});
function generateOrderNumber() {
    const date = new Date();
    const datePart = date.getFullYear().toString() +
        String(date.getMonth() + 1).padStart(2, '0') +
        String(date.getDate()).padStart(2, '0');
    const randomPart = String(Math.floor(Math.random() * 9000) + 1000);
    return `TM-${datePart}-${randomPart}`;
}

function calculateTotal() {
    let total = 0;
    qtyInputs.forEach(i => {
        total += (Number(i.value) || 0) * (Number(i.dataset.price) || 0);
    });
    document.getElementById("totalAmount").innerText = total;
}

// ================= CHECK PRODUCT BEFORE POPUP =================
function openOrderPopup() {
    let total = 0;
    qtyInputs.forEach(i => {
        total += (Number(i.value) || 0) * (Number(i.dataset.price) || 0);
    });

    if (total <= 0) {
        alert("Please add quantity for at least one product");
        return;
    }

    new bootstrap.Modal(document.getElementById("customerModal")).show();
}

// ================= CONFIRM ORDER =================
function confirmOrder() {
    const name    = document.getElementById('custName').value.trim();
    const phone   = document.getElementById('custPhone').value.trim();
    const city    = document.getElementById('custCity').value.trim();
    const pincode = document.getElementById('custPincode').value.trim();
    const address = document.getElementById('custAddress').value.trim();

    if (!name || !phone || !city || !pincode || !address) {
        alert('Please fill in all details before confirming.');
        return;
    }

    // Build cart summary
    let cartItems = [];
    let totalAmount = 0;

    document.querySelectorAll('.qty').forEach(input => {
        const qty = parseInt(input.value);
        if (qty > 0) {
            const itemName  = input.getAttribute('data-name');
            const itemPrice = parseInt(input.getAttribute('data-price'));
            const itemTotal = qty * itemPrice;
            totalAmount += itemTotal;
            cartItems.push(`${itemName} x${qty} = ₹${itemTotal}`);
        }
    });

    if (cartItems.length === 0) {
        alert('Please add at least one product to your order.');
        return;
    }

    // Close the Bootstrap modal
    const modalEl = document.getElementById('customerModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    // Launch Razorpay
    const options = {
        key: 'rzp_test_SaDxLuhgtKLAB7',   // ✅ Fixed: correct key format
        amount: totalAmount * 100,
        currency: 'INR',
        name: 'Thanga Mani',
        description: 'Peanut Burfi Order',
        image: 'images/logo.png',
        prefill: {
            name:    name,
            contact: phone,
        },
        notes: {
            address: address,
            city:    city,
            pincode: pincode,
            items:   cartItems.join(', '),
        },
        theme: {
            color: '#c8a96e',
        },
        handler: function (response) {
    const paymentId = response.razorpay_payment_id;
    const orderNumber = generateOrderNumber();

    // EmailJS — send to admin
    const templateParams = {
        order_number:     orderNumber,
        payment_id:       paymentId,
        total_amount:     totalAmount,
        customer_name:    name,
        customer_phone:   phone,
        customer_address: address,
        customer_city:    city,
        customer_pincode: pincode,
        order_items:      cartItems.join('\n'),
        admin_email:      'sharukeshavalingam21@gmail.com',
    };

    emailjs.send('service_ujdih9m', 'template_2k1ctp2', templateParams)
        .then(() => console.log('Email sent'))
        .catch(err => console.error('Email failed:', err));

    

    // Show success popup
    showSuccessPopup({ orderNumber, paymentId, totalAmount, name, cartItems });

    // Reset
    document.querySelectorAll('.qty').forEach(i => i.value = '');
    document.getElementById('totalAmount').innerText = 0;
},
        modal: {
            ondismiss: function () {
                alert('Payment cancelled. Please try again.');
            }
        }
    };

    const rzp = new Razorpay(options);
    rzp.open();
}

function showSuccessPopup({ orderNumber, paymentId, totalAmount, name, cartItems }) {
    const itemsHTML = cartItems.map(item => {
        const parts = item.split(' = ');
        return `<div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span style="font-size:13px;color:#666;">${parts[0]}</span>
            <span style="font-size:13px;">${parts[1]}</span>
        </div>`;
    }).join('');

    const popup = document.createElement('div');
    popup.innerHTML = `
    <div id="successOverlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem;">
      <div style="background:#fff;border-radius:16px;padding:2rem;max-width:400px;width:100%;text-align:center;font-family:sans-serif;">
        <div style="width:56px;height:56px;border-radius:50%;background:#EAF3DE;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <p style="font-size:18px;font-weight:600;margin:0 0 4px;">Payment Successful!</p>
        <p style="font-size:13px;color:#888;margin:0 0 1.5rem;">Thank you, ${name}!</p>
        <div style="background:#f7f7f5;border-radius:10px;padding:1rem;margin-bottom:1.25rem;text-align:left;">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <span style="font-size:12px;color:#888;">Order number</span>
            <span style="font-size:13px;font-weight:600;font-family:monospace;">${orderNumber}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
            <span style="font-size:12px;color:#888;">Payment ID</span>
            <span style="font-size:13px;font-family:monospace;">${paymentId}</span>
          </div>
          <hr style="border:none;border-top:1px solid #eee;margin:8px 0;">
          ${itemsHTML}
          <hr style="border:none;border-top:1px solid #eee;margin:8px 0;">
          <div style="display:flex;justify-content:space-between;">
            <span style="font-weight:600;">Total paid</span>
            <span style="font-weight:600;">₹${totalAmount}</span>
          </div>
        </div>
        <p style="font-size:12px;color:#aaa;margin:0 0 1.25rem;">Order confirmation sent to admin via email & WhatsApp.</p>
        <button onclick="document.getElementById('successOverlay').remove()"
          style="width:100%;padding:12px;background:#c8a96e;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;">
          Done
        </button>
      </div>
    </div>`;
    document.body.appendChild(popup);
}