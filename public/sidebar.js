function initSidebar() {
    let sidebar = document.querySelector(".sidebar");
    let closeBtn = document.querySelector("#btn");
    let searchBtn = document.querySelector(".bx-search");
    let homeSection = document.querySelector(".home-section");

    if (closeBtn && sidebar && homeSection) {  
        closeBtn.addEventListener("click", () => {
            sidebar.classList.toggle("open");
            homeSection.classList.toggle("shifted"); //décalage contenu principal
            menuBtnChange();
        });

        searchBtn.addEventListener("click", ()=>{ // Sidebar open when you click on the search iocn
            sidebar.classList.toggle("open");
            homeSection.classList.toggle("shifted");
            menuBtnChange();
        });

        function menuBtnChange() {
            if (sidebar.classList.contains("open")) {
                closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
            } else {
                closeBtn.classList.replace("bx-menu-alt-right", "bx-menu");
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", initSidebar);