
document.getElementById('searchInput').addEventListener('keyup', function () {
    let filter = this.value.toLowerCase();
    let rows = document.querySelectorAll('tbody tr');

    rows.forEach(row => {
        let text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? '' : 'none';
    });
});



function openformular() {
    document.getElementById("formular").style.display = "grid";
}
function closeformular() {
    document.getElementById("formular").style.display = "none";
}
