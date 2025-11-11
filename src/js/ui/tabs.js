export function initializeTabs() {
    const tabNavs = document.querySelectorAll('.tab-nav');

    tabNavs.forEach(tabNav => {
        tabNav.addEventListener('click', event => {
            if (!event.target.matches('.tab-link[data-tab-target]')) {
                return;
            }

            const clickedTab = event.target;
            const tabContainer = clickedTab.closest('.tab-panel-card');
            const targetSelector = clickedTab.dataset.tabTarget;
            const targetPanel = tabContainer.querySelector(targetSelector);

            if (!targetPanel) {
                console.error(`Tab target not found: ${targetSelector}`);
                return;
            }

            tabContainer.querySelectorAll('.tab-link').forEach(tab => tab.classList.remove('active'));
            tabContainer.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

            clickedTab.classList.add('active');
            targetPanel.classList.add('active');
        });
    });
}