module.exports = {
    apps: [{
        name: 'idaas_rp',
        script: './bin/www',
        output: './storage/logs/debug.log',
        error: './storage/logs/error.log',
        merge_logs: true
    }]
};