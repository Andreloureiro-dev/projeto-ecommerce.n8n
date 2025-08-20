document.addEventListener("DOMContentLoaded", () => {
    const menuHamburguer = document.querySelector(".menu-hamburguer");
    const header = document.querySelector(".header");

    menuHamburguer.addEventListener("click", () => {
        header.classList.toggle("menu-ativo");
    });
});
