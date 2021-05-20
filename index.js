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
            _stonks: {},
        };
    },

    computed: {
        stonks() {
            return Object.values(this._stonks).map(stonk => {
                if (!stonk) {
                    return null;
                }

                const openPrice = Number(stonk.info.open_price);
                const markPrice = Number(stonk.info.mark_price);
                const diff = openPrice - markPrice;
                const decimalLength = markPrice > 1 ? 2 : 6;

                return {
                    name: stonk.name,
                    prefix: diff < 0 ? '+' : '-',
                    className: diff < 0 ? 'up' : 'down',
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
                maximumFractionDigits: decimalLength,
            });
        },

        init(name, path) {
            this._stonks[path] = null;

            this.getAuth(path).then(auth => {
                setInterval(() => {
                    this.getInfo(auth).then(info => {
                        this._stonks[path] = { name, info };
                    });
                }, 1000);
            });
        },

        async getAuth(path) {
            const request = await fetch(`${C}/robinhood.com:443/${path}`, {
                headers: {
                    Accept: 'text/html',
                    'User-Agent': USER_AGENT,
                    'X-Requested-With': 'magic',
                },
            });
            const content = await request.text();

            const [, rawAuth] = content.match(
                /^ *window\.auth *= *({.+?});? *$/m,
            );
            const auth = JSON.parse(rawAuth);

            const [, currencyPair] = content.match(
                /content="robinhood:\/\/currency_pair\?id=([^"]+)"/,
            );

            return {
                auth,
                currencyPair,
            };
        },

        async getInfo({ auth, currencyPair }) {
            const request = await fetch(
                `${C}/api.robinhood.com:443/marketdata/forex/quotes/${currencyPair}/`,
                {
                    headers: {
                        Authorization: `${auth.token_type} ${auth.access_token}`,
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
