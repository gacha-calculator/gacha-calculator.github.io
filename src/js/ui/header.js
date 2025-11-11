export function manageHeader() {
    const expandBtn = document.getElementById('expand-button');
    const expandedMenu = document.getElementById('expandedMenu');
    let draggedItem = null;

    if (expandBtn) {
        expandBtn.addEventListener('click', () => {
            expandBtn.classList.toggle('dropdown--open');
            expandedMenu.classList.toggle('active');
        });
    }

    const buttons = document.querySelectorAll('.nav-button');

    // Drag and drop functionality
    buttons.forEach(button => {
        button.addEventListener('dragstart', function () {
            draggedItem = this;
            setTimeout(() => {
                this.classList.add('dragging');
            }, 0);
        });

        button.addEventListener('dragend', function () {
            this.classList.remove('dragging');
            draggedItem = null;

            buttons.forEach(btn => {
                btn.classList.remove('drop-zone');
            });
        });

        button.addEventListener('dragover', function (e) {
            e.preventDefault();
            if (draggedItem && draggedItem !== this) {
                this.classList.add('drop-zone');
            }
        });

        button.addEventListener('dragleave', function () {
            this.classList.remove('drop-zone');
        });

        button.addEventListener('drop', function (e) {
            e.preventDefault();
            this.classList.remove('drop-zone');

            if (draggedItem && draggedItem !== this) {
                const draggedParent = draggedItem.parentNode;
                const targetParent = this.parentNode;

                const temp1 = document.createElement('div');
                const temp2 = document.createElement('div');

                draggedParent.insertBefore(temp1, draggedItem);
                targetParent.insertBefore(temp2, this);

                draggedParent.insertBefore(this, temp1);
                targetParent.insertBefore(draggedItem, temp2);

                draggedParent.removeChild(temp1);
                targetParent.removeChild(temp2);

                saveNavOrder();
            }
        });
    });

    loadNavOrder();
    const navContainer = document.querySelector('.nav-container');
    navContainer.style.opacity = '1';
}

function saveNavOrder() {
    const mainNav = document.querySelector('.nav-list');
    const expandedNav = document.querySelector('.nav-container--expanded .nav-list');

    const order = {
        main: Array.from(mainNav.children).slice(0, -1).map(li => li.querySelector('.nav-button').getAttribute('href')),
        expanded: Array.from(expandedNav.children).map(li => li.querySelector('.nav-button').getAttribute('href'))
    };

    localStorage.setItem('navOrder', JSON.stringify(order));
}

function loadNavOrder() {
    const saved = JSON.parse(localStorage.getItem('navOrder'));
    if (!saved) return;

    const mainNav = document.querySelector('.nav-list');
    const expandedNav = document.querySelector('.nav-container--expanded .nav-list');
    const homeButton = mainNav.lastElementChild;

    const allItems = new Map();
    document.querySelectorAll('li').forEach(li => {
        const button = li.querySelector('.nav-button');
        if (button) {
            allItems.set(button.getAttribute('href'), li);
        }
    });

    const mainItems = Array.from(mainNav.children).slice(0, -1);
    mainItems.forEach(li => li.remove());
    expandedNav.innerHTML = '';

    saved.main.forEach(href => {
        const li = allItems.get(href);
        if (li) mainNav.insertBefore(li, homeButton);
    });

    saved.expanded.forEach(href => {
        const li = allItems.get(href);
        if (li) expandedNav.appendChild(li);
    });
}