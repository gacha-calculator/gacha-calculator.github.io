const SCHEMA_VERSIONS = {
    TABLES: 1,
    CALCULATIONS: 1,
    PULL_PLANS: 1,
    BUTTONS: 1
};

export function createPersistence(namespace, SELECTORS) {
    if (!namespace) {
        throw new Error('Persistence factory requires a namespace.');
    };

    const STORAGE_KEYS = {
        TABLES: `gacha_tables_${namespace}_v1`,
        CALCULATIONS: `gacha_calc_${namespace}_v1`,
        PULL_PLANS: `gacha_plans_${namespace}_v1`,
        BUTTONS: 'gacha_buttons_${namespace}_v1'
    };

    return {
        DEBOUNCE_TIME: 1500,
        debug: false,
        saveTimeout: null,

        init() {
            this.setupTableListeners();
            window.addEventListener('beforeunload', () => this.saveTables());
        },

        saveCalculation(results) {
            this._save(STORAGE_KEYS.CALCULATIONS, {
                _schema: SCHEMA_VERSIONS.CALCULATIONS,
                ...results
            });
        },

        loadCalculation() {
            return this._validate(
                this._load(STORAGE_KEYS.CALCULATIONS),
                'CALCULATIONS'
            );
        },

        saveTables() {
            this._save(STORAGE_KEYS.TABLES, {
                _schema: SCHEMA_VERSIONS.TABLES,
                pity: this.getPityData(),
                constellation: this.getConstellationData(),
                rateUps: this.getRateUpData()
            });
        },

        loadTables() {
            return this._validate(
                this._load(STORAGE_KEYS.TABLES),
                'TABLES'
            );
        },

        saveButtons() {
            this._save(STORAGE_KEYS.BUTTONS, {
                _schema: SCHEMA_VERSIONS.BUTTONS,
                isHidden: this.areButtonsHidden()
            });
        },

        loadButtons() {
            return (
                this._load(STORAGE_KEYS.BUTTONS)
            );
        },

        getPityData() {
            return Array.from(document.querySelectorAll(`${SELECTORS.PITY_TABLE} tbody tr`)).map(row => ({
                banner: row.dataset.banner,
                ...(row.querySelector('[data-control="pity-4"]') && { pity4: row.querySelector('[data-control="pity-4"]').value }),
                ...(row.querySelector('[data-control="pity-5"]') && { pity5: row.querySelector('[data-control="pity-5"]').value }),
                ...(row.querySelector('.guarantee-4') && { guarantee4: row.querySelector('.guarantee-4').checked }),
                ...(row.querySelector('.guarantee-5') && { guarantee5: row.querySelector('.guarantee-5').checked }),
                ...(row.querySelector('[data-control="capRad"]') && { caprad: row.querySelector('[data-control="capRad"]').value }),
                ...(row.querySelector('[data-control="epPath"]') && { epPath: row.querySelector('[data-control="epPath"]').value })
            }));
        },

        getConstellationData() {
            return Array.from(document.querySelectorAll(`${SELECTORS.CONSTELLATION_TABLE} tbody tr`)).map(row =>
                Array.from(row.querySelectorAll('td:nth-child(n+2) input')).map(input => input.value)
            );
        },

        getRateUpData() {
            return Array.from(document.querySelectorAll('#rate-up-table select.custom-select')).map(select => select.value);
        },

        areButtonsHidden() {
            const button = document.querySelector('.help-btn');
            return button.classList.contains('hidden');
        },

        setupTableListeners() {
            const elementsToWatch = [
                `${SELECTORS.PITY_TABLE} input`,
                `${SELECTORS.CONSTELLATION_TABLE} input`,
                '#rate-up-table select'
            ].join(',');

            document.querySelectorAll(elementsToWatch).forEach(input => {
                input.addEventListener('input', () => this.queueSave());
            });
        },

        queueSave() {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(() => this.saveTables(), this.DEBOUNCE_TIME);
        },

        _save(key, data) {
            try {
                localStorage.setItem(key, JSON.stringify(data));
            } catch (e) {
                console.error('Storage error:', e);
                this._handleStorageError();
            }
        },

        _load(key) {
            try {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                console.error('Load error:', e);
                return null;
            }
        },

        _validate(data, type) {
            if (!data) return null;

            if (typeof data._schema === 'undefined') {
                return data;
            }

            if (data._schema !== SCHEMA_VERSIONS[type]) {
                console.warn(`Schema version mismatch for ${type}`);
                return null;
            }

            return data;
        },

        _handleStorageError() {
            Object.values(STORAGE_KEYS).forEach(k => {
                try {
                    localStorage.removeItem(k);
                } catch (e) {
                    console.error('Cleanup failed:', e);
                }
            });
        }
    };
}