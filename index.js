import { createApp } from 'vue';
import Roller from './Roller.vue';

const C = 'https://lungers.com/stonks/cors';
const USER_AGENT =
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:88.0) Gecko/20100101 Firefox/88.0';

const app = createApp({
    components: {
        Roller,
    },

    data() {
        return {
            stonksOrder: [],
            _stonks: {},
        };
    },

    computed: {
        sortedStonks() {
            return Object.values(this._stonks).sort((a, b) => {
                if (!a && !b) {
                    return 0;
                } else if (a && !b) {
                    return 0;
                } else if (!a && b) {
                    return 1;
                }

                return (
                    this.stonksOrder.indexOf(a.name) -
                    this.stonksOrder.indexOf(b.name)
                );
            });
        },
        titleColor() {
            const stonks = this.sortedStonks.filter(Boolean);

            if (stonks.length === 0) {
                return 'green';
            }

            const diffs = stonks.map(stonk => {
                if (!stonk) {
                    return true;
                }

                const openPrice = Number(stonk.info.open_price);
                const markPrice = Number(stonk.info.mark_price);
                const diff = markPrice - openPrice;

                return diff > 0;
            });

            return diffs.every(Boolean)
                ? 'green'
                : diffs.some(Boolean)
                ? 'orange'
                : 'red';
        },
        stonks() {
            return this.sortedStonks.map(stonk => {
                if (!stonk) {
                    return null;
                }

                const openPrice = Number(stonk.info.open_price);
                const markPrice = Number(stonk.info.mark_price);
                const diff = markPrice - openPrice;
                const decimalLength = markPrice > 1 ? 2 : 6;

                return {
                    name: stonk.name,
                    prefix: diff > 0 ? '+' : '-',
                    className: diff > 0 ? 'green' : 'red',
                    price: this.formatNumber(markPrice, decimalLength),
                    diff: this.formatNumber(Math.abs(diff), decimalLength),
                    percentage: this.formatNumber(
                        (100 * Math.abs(diff)) / markPrice,
                        2,
                    ),
                };
            });
        },
    },

    created() {
        this.init('Dogecoin', 'crypto/doge');
        this.init('Ethereum', 'crypto/eth');
        this.init('Bitcoin', 'crypto/btc');
    },

    methods: {
        formatNumber(number, decimalLength) {
            return number.toLocaleString(undefined, {
                minimumFractionDigits: number % 1 === 0 ? 0 : 2,
                maximumFractionDigits: decimalLength,
            });
        },

        init(name, path) {
            this.stonksOrder.push(name);
            this._stonks[path] = null;

            this.getInitialData(path).then(
                ({ accessToken, currencyPair, info }) => {
                    this._stonks[path] = { name, info };

                    setInterval(() => {
                        this.getInfo(accessToken, currencyPair).then(info => {
                            this._stonks[path] = { name, info };
                        });
                    }, 1000);
                },
            );
        },

        async getInitialData(path) {
            const request = await fetch(`${C}/robinhood.com:443/${path}/`, {
                headers: {
                    Accept: 'text/html',
                    'User-Agent': USER_AGENT,
                    'X-Requested-With': 'magic',
                },
            });
            const content = await request.text();

            const _html = document.createElement('html');
            _html.innerHTML = content;
            const data = JSON.parse(
                _html.querySelector('#__NEXT_DATA__').textContent,
            );

            const {
                accessToken,
                currencyPair: { id: currencyPair },
                dehydratedState: { queries },
            } = data.props.pageProps;
            const {
                state: { data: info },
            } = queries.find(
                query =>
                    Array.isArray(query.queryKey) &&
                    query.queryKey[0] === 'currencyPairQuote',
            );

            return {
                accessToken,
                currencyPair,
                info,
            };
        },

        async getInfo(accessToken, currencyPair) {
            const request = await fetch(
                `${C}/api.robinhood.com:443/marketdata/forex/quotes/${currencyPair}/`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'User-Agent': USER_AGENT,
                        'X-Requested-With': 'magic',
                    },
                },
            );
            const info = await request.json();
            return info;
        },
    },
});

app.mount('#app');
