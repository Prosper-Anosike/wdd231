// Navigation toggle functionality for mobile menu

document.addEventListener('DOMContentLoaded', () => {
    const navButton = document.getElementById('nav-button');
    const navMenu = document.querySelector('nav ul');

    if (navButton && navMenu) {
        navButton.addEventListener('click', () => {
            // Toggle the show class on the navigation menu
            navMenu.classList.toggle('show');

            // Toggle the open class on the button for hamburger animation
            navButton.classList.toggle('open');
        });
    }
});
