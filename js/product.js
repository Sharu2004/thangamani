// ================= TOTAL CALCULATION =================
let qtyInputs = document.querySelectorAll(".qty");

qtyInputs.forEach(input => {
    input.addEventListener("input", () => {
        if (input.value === "") input.value = 0;
        calculateTotal();
    });
});

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
            const paymentId = response.razorpay_payment_id;  // ✅ Fixed: correct property name

            // Send email to admin via EmailJS
            const templateParams = {
                payment_id:       paymentId,
                total_amount:     totalAmount,
                customer_name:    name,
                customer_phone:   phone,
                customer_address: address,
                customer_city:    city,
                customer_pincode: pincode,
                order_items:      cartItems.join('\n'),
                admin_email:      'sharukeshavalingam21@gmail.com', // 📧 Replace this
            };

            emailjs.send('service_ujdih9m', 'template_8586xpk', templateParams)
                .then(() => console.log('✅ Email sent to admin.'))
                .catch(err => console.error('❌ Email failed:', err));

            // Send WhatsApp
            let msg = `🛒 *New Order - Thanga Mani*\n\n`;
            msg += `✅ *Payment ID:* ${paymentId}\n`;
            msg += `💰 *Total:* ₹${totalAmount}\n\n`;
            msg += `👤 *Name:* ${name}\n`;
            msg += `📞 *Phone:* ${phone}\n`;
            msg += `📍 *Address:* ${address}, ${city} - ${pincode}\n\n`;
            msg += `📦 *Items:*\n${cartItems.join('\n')}`;

            const waNumber = '919965061448';
            window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');

            // Reset form
            document.querySelectorAll('.qty').forEach(i => i.value = '');
            alert(`✅ Payment successful!\nPayment ID: ${paymentId}\nOrder notification sent!`);
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