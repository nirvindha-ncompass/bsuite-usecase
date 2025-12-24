declare const _default: () => {
    port: number;
    database: {
        host: string;
        port: number;
        name: string;
        user: string;
        password: string;
    };
    clickhouse: {
        host: string;
        port: number;
        user: string;
        password: string;
    };
    defaultEngine: string;
};
export default _default;
