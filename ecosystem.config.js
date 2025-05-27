module.exports= {
    apps: [
        {
            name: 'API_APP',
            script: 'build/infra/http/server.js',
            env: {
                NODE_ENV: 'prod',
                DATABASE_URL: 'mysql://softilux:K%23Maxm7BATp3wRxQyW5@10.180.0.15:3306/pws',
                PORT: 3308,
                ACCOUNT:'ACe03fc6282bb0c24b829c28dfdcfd6043',
                AUTH:'5338c9ad4eb5e895bd1dbaae2bc16608',
            },
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            instances: 1,
            exec_interpreter: 'node',
            exec_mode: 'cluster',
            autorestart: true,
            max_memory_restart: '1200M',
            watch: false,
            ignore_watch: ['node_modules'],
            watch_options: {
                usePolling: true,
                interval: 1000,
            },
        },
    ]
}

