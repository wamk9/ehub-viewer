export default {
    form: [
        [
            {
                independentRow: true,
                sizes: {
                    xs: 12,
                },
                inputs: [
                    { name: 'event-name', type: 'text', inputValue: '', eventValue: '', validate: { regex: /^[a-zA-Z0-9 .,!?'"@#%&()\-_:;]{5,60}$/, rewrite: true, onBlur: true } },
                    { name: 'event-endpoint', type: 'text', inputValue: '', eventValue: '', validate: { regex: /^[a-zA-Z0-9_-]{5,60}$/, rewrite: true, onBlur: true } },
                    { name: 'event-short-description', type: 'text', inputValue: '', eventValue: '', validate: { regex: /^[a-zA-Z0-9 .,!?'"@#%&()\-_:;]{0,180}$/, rewrite: true, onBlur: true } },
                    { name: 'event-description', type: 'text', inputValue: '', eventValue: '', validate: { regex:  /^[a-zA-Z0-9 .,!?'"@#%&()\-_:;]{0,2000}$/, rewrite: true, onBlur: true } },
                    { name: 'event-currency', type: 'list', inputValue: { api: { endpoint: 'demo', key: 'acronym' } }, eventValue: '', validate: { regex: /^[\s\S]{1,10}$/, rewrite: true, onBlur: true } },
                    { name: 'event-register-fee', type: 'number', inputValue: '', eventValue: '', show: { key: { name: 'name', value: 'event-currency'}, valueDiff: 'free' }, validate: { regex: /^\d+(\.\d{1,2})?$/, rewrite: true, onBlur: true } },
                ]
            },
        ]
    ],
    data: [

    ]
};