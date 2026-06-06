export default {
    form: [
        [
            {
                independentRow: true,
                sizes: {
                    xs: 12,
                },
                inputs: [
                    { name: 'game', type: 'title', eventValue: {} },
                    { name: 'game', type: 'description', eventValue: {} },
                    { type: 'separator' }
                ]
            },
            {
                independentRow: true,
                sizes: {
                    xs: 12,
                    md: 6,
                    lg: 6
                },
                offsets: {
                    md: 3,
                    lg: 3
                },
                inputs: [
                    {
                        name: 'game', type: 'list', inputValue: [
                            'assetto-corsa',
                            'assetto-corsa-competizione',
                            'assetto-corsa-evo',
                            'automobilista',
                            'automobilista-2',
                            'forza-motorsport',
                            'forza-motorsport-7',
                            'forza-horizon-4',
                            'forza-horizon-5',
                            'gran-turismo-sport',
                            'gran-turismo-7',
                            'gran-turismo-6',
                            'gran-turismo-5',
                            'iracing',
                            'rfactor',
                            'rfactor-2',
                            'live-for-speed',
                            'project-cars',
                            'project-cars-2',
                            'project-cars-3',
                            'race-room-experience',
                            'race-07',
                            'gtr',
                            'gtr-2',
                            'grid-2',
                            'grid-autosport',
                            'grid-legends',
                            'nascar-heat-4',
                            'nascar-heat-5',
                            'nascar-ignition',
                            'f1-2019',
                            'f1-2020',
                            'f1-2021',
                            'f1-22',
                            'f1-23',
                            'f1-24',
                            'f1-manager-22',
                            'f1-manager-23',
                            'f1-manager-24',
                            'dirt-rally',
                            'dirt-rally-2-0',
                            'dirt-4',
                            'dirt-5',
                            'wrc-10',
                            'wrc-generations',
                            'ea-sports-wrc',
                            'colin-mcrae-rally-2-0',
                            'colin-mcrae-rally-3',
                            'the-crew',
                            'the-crew-2',
                            'the-crew-motorfest',
                            'trackmania-2020',
                            'trackmania-united',
                            'trackmania-forever',
                            'trackmania-nations',
                            'kartkraft',
                            'kart-racing-pro',
                            'netkar-pro',
                            'richard-burns-rally',
                            'rally-trophy',
                            'need-for-speed-shift',
                            'need-for-speed-shift-2-unleashed',
                            'need-for-speed-hot-pursuit',
                            'drift21',
                            'drift-ce-legacy',
                            'gp-bikes',
                            'mx-bikes',
                            'motogp-21',
                            'motogp-22',
                            'motogp-23',
                            'motogp-24',
                            'gp2-series-online',
                            'motorsport-manager-online',
                            'truck-racing-by-renault',
                            'bus-simulator-21',
                            'kart-racing-league',
                            'sebastien-loeb-rally-evo',
                            'indycar-series',
                            'indycar-series-2005',
                            'forza-horizon-3',
                            'forza-horizon-2',
                            'forza-horizon',
                            'test-drive-unlimited',
                            'test-drive-unlimited-2',
                            'gran-turismo-4',
                            'gran-turismo-3-a-spec',
                            'need-for-speed-payback',
                            'need-for-speed-heat',
                            'project-gotham-racing-online',
                            'vrally-4',
                            'beamng-drive',
                        ], eventValue: ''
                    },
                ]
            },
            {
                independentRow: true,
                sizes: {
                    xs: 12,
                },
                inputs: [
                    { name: 'event-settings', type: 'title', eventValue: {} },
                    { name: 'event-settings', type: 'description', eventValue: {} },
                    { type: 'separator' },
                ]
            },
            {
                independentRow: true,
                sizes: {
                    xs: 12,
                    md: 6,
                    lg: 6
                },
                inputs: [
                    { name: 'multiclass', type: 'multitext', eventValue: [], multiInput: { key: 'name', value: 'eventValue' } },
                ]
            },
            {
                independentRow: false,
                sizes: {
                    xs: 12,
                    md: 12,
                    lg: 6
                },
                inputs: [
                    { name: 'consume-percent', type: 'number', eventValue: '' },
                    { name: 'wear-percent', type: 'number', eventValue: '' },
                    { name: 'damage-percent', type: 'number', eventValue: '' },
                    { name: 'real-weather', type: 'switch', eventValue: false },
                    { name: 'livestream', type: 'switch', eventValue: false },
                ]
            },

            //{ name: 'track', type: 'textarea', eventValue: '', hasLabel: true },
            //{ name: 'categories', type: 'multitext', eventValue: [], hasLabel: true, multiInput: { key: 'name' } },
        ]
    ],
    multiclass: [
        [
            {
                independentRow: false,
                sizes: {
                    xs: 12,
                    md: 12,
                    lg: 12
                },
                inputs: [
                    { name: 'multiclass-header', type: 'title' },
                    { name: 'multiclass-header', type: 'description' },
                    { type: 'separator' }
                ]
            },
            {
                independentRow: true,
                sizes: {
                    xs: 12,
                    md: 6,
                    lg: 4
                },
                inputs: [
                    { name: 'multiclass-image', type: 'image', eventValue: '' }
                ]
            },
            {
                independentRow: false,
                sizes: {
                    xs: 12,
                    md: 6,
                    lg: 8
                },
                inputs: [
                    { name: 'multiclass-color', type: 'color', inputValue: '', eventValue: '' },
                    { name: 'multiclass-qtd', type: 'number', inputValue: '', eventValue: '' },
                    { name: 'cars-type-enabled', type: 'multitext', eventValue: [] },
                    { name: 'cars-specific-enabled', type: 'multitext', eventValue: [] },
                ]
            },

        ]
    ],
    data: [

    ]
};