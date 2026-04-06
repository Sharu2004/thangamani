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

    let name = custName.value.trim();
    let phone = custPhone.value.trim();
    let city = custCity.value.trim();
    let pincode = custPincode.value.trim();
    let address = custAddress.value.trim();

    // Validation
    if (name=="" || phone=="" || city=="" || pincode=="" || address=="") {
        alert("Please fill all delivery details");
        return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
        alert("Enter valid 10 digit phone number");
        return;
    }

    if (!/^\d{6}$/.test(pincode)) {
        alert("Enter valid 6 digit pincode");
        return;
    }

    // Message Format
    let msg = `THANGAMANI NEW ORDER\n`;
    msg += `--------------------------\n`;
    msg += `Name: ${name}\n`;
    msg += `Phone: ${phone}\n`;
    msg += `City: ${city}\n`;
    msg += `Pincode: ${pincode}\n`;
    msg += `Address: ${address}\n`;
    msg += `--------------------------\n`;
    msg += `Product Details:\n\n`;

    let total = 0;

    qtyInputs.forEach(i => {
        let qty = Number(i.value) || 0;
        if (qty > 0) {
            let pname = i.dataset.name;
            let price = Number(i.dataset.price);
            let sub = qty * price;
            total += sub;

            msg += `${pname}\nQty: ${qty} x ₹${price} = ₹${sub}\n\n`;
        }
    });

    msg += `--------------------------\n`;
    msg += `TOTAL AMOUNT: ₹${total}\n`;
    msg += `--------------------------\n`;
    msg += `Please confirm this order.`;

    // WhatsApp Number
    let number = "919965061448";

    let url = "https://wa.me/" + number + "?text=" + encodeURIComponent(msg);
    window.open(url, "_blank");
}
