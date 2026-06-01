addEventListener("DOMContentLoaded", (evt) => {
        document.getElementById("Übersicht").style.display = "block";
        evt.currentTarget.classList.add("active");
    })
    function choosetable(evt, choose) {
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].classList.remove("active");
        }
        document.getElementById(choose).style.display = "block";
        evt.currentTarget.classList.add("active");
    }