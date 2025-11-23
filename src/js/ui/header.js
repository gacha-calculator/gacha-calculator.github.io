export function manageHeader() {
    const expandBtn = document.getElementById('expand-button');
    const expandedMenu = document.getElementById('expandedMenu');
    let draggedLi = null;

    if (expandBtn) {
        expandBtn.addEventListener('click', () => {
            expandBtn.classList.toggle('dropdown--open');
            expandedMenu.classList.toggle('active');
        });
    }

    const draggableLis = document.querySelectorAll('.nav-list > li:has(.nav-button)');

    draggableLis.forEach(li => { // desktop
        const button = li.querySelector('.nav-button');

        button.addEventListener('dragstart', function (e) {
            draggedLi = li;
            const rect = li.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;
            e.dataTransfer.setDragImage(li, offsetX, offsetY);
            li.classList.add('dragging');
        });

        button.addEventListener('dragend', function () {
            li.classList.remove('dragging');
            draggedLi = null;
            document.querySelectorAll('.drop-zone').forEach(el => el.classList.remove('drop-zone'));
        });

        button.addEventListener('dragover', function (e) {
            e.preventDefault();
            if (draggedLi && draggedLi !== li) {
                li.classList.add('drop-zone');
            }
        });

        button.addEventListener('dragleave', function () {
            li.classList.remove('drop-zone');
        });

        button.addEventListener('drop', function (e) {
            e.preventDefault();
            li.classList.remove('drop-zone');
            if (!draggedLi || draggedLi === li) return;

            const draggedParent = draggedLi.parentNode;
            const targetParent = li.parentNode;

            const temp1 = document.createElement('li');
            const temp2 = document.createElement('li');
            temp1.hidden = true;
            temp2.hidden = true;

            draggedParent.insertBefore(temp1, draggedLi);
            targetParent.insertBefore(temp2, li);

            draggedParent.insertBefore(li, temp1);
            targetParent.insertBefore(draggedLi, temp2);

            draggedParent.removeChild(temp1);
            targetParent.removeChild(temp2);

            saveNavOrder();
        });
    });

    if ('ontouchstart' in window) { // mobile
        draggableLis.forEach(li => {
            const button = li.querySelector('.nav-button');
            let isDragging = false;

            button.addEventListener('touchstart', (e) => {
                isDragging = false;
                setTimeout(() => {
                    isDragging = true;
                    li.classList.add('dragging');
                }, 180);
            });

            button.addEventListener('touchmove', (e) => {
                if (isDragging) e.preventDefault();
            }, { passive: false });

            button.addEventListener('touchend', (e) => {
                if (!isDragging) return;
                li.classList.remove('dragging');
                isDragging = false;
                e.preventDefault();

                const touch = e.changedTouches[0];
                const elem = document.elementFromPoint(touch.clientX, touch.clientY);
                const dropLi = elem?.closest('.nav-list > li:has(.nav-button), .nav-container--expanded .nav-list > li:has(.nav-button)');

                if (dropLi && dropLi !== li) {
                    const draggedParent = li.parentNode;
                    const targetParent = dropLi.parentNode;

                    const temp1 = document.createElement('li');
                    const temp2 = document.createElement('li');
                    temp1.hidden = true;
                    temp2.hidden = true;

                    draggedParent.insertBefore(temp1, li);
                    targetParent.insertBefore(temp2, dropLi);

                    draggedParent.insertBefore(dropLi, temp1);
                    targetParent.insertBefore(li, temp2);

                    draggedParent.removeChild(temp1);
                    targetParent.removeChild(temp2);

                    saveNavOrder();
                }
            });
        });
    }

    loadNavOrder();
    const navContainer = document.querySelector('.nav-container');
    if (navContainer) navContainer.style.opacity = '1';
}

function saveNavOrder() {
    const mainNav = document.querySelector('.nav-list');
    const expandedNav = document.querySelector('.nav-container--expanded .nav-list');

    const mainOrder = Array.from(mainNav.children)
        .filter(li => li.querySelector('.nav-button')) // excludes Home li
        .map(li => li.querySelector('.nav-button').getAttribute('href'));

    const expandedOrder = Array.from(expandedNav.children)
        .map(li => li.querySelector('.nav-button').getAttribute('href'));

    localStorage.setItem('navOrder', JSON.stringify({ main: mainOrder, expanded: expandedOrder }));
}

function loadNavOrder() {
    const saved = JSON.parse(localStorage.getItem('navOrder'));
    if (!saved) return;

    const mainNav = document.querySelector('.nav-list');
    const expandedNav = document.querySelector('.nav-container--expanded .nav-list');
    const homeLi = mainNav.lastElementChild;

    const allItems = new Map();
    document.querySelectorAll('li').forEach(li => {
        const btn = li.querySelector('.nav-button');
        if (btn) {
            allItems.set(btn.getAttribute('href'), li);
        }
    });

    Array.from(mainNav.children).forEach(li => {
        if (li !== homeLi) li.remove();
    });
    expandedNav.innerHTML = '';

    saved.main.forEach(href => {
        const li = allItems.get(href);
        if (li) mainNav.insertBefore(li, homeLi);
    });

    saved.expanded.forEach(href => {
        const li = allItems.get(href);
        if (li) expandedNav.appendChild(li);
    });
}