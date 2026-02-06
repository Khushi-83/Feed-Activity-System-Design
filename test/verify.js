const http = require('http');

const BASE_URL = 'http://localhost:3000';

const request = (method, path, body = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
};

const runVerification = async () => {
    console.log('Starting verification...');

    try {
        // 1. Create Event
        console.log('\n--- Test: Create Event ---');
        const eventData = {
            actor_id: 'user_A',
            verb: 'posted',
            object_type: 'photo',
            object_id: 'photo_101',
            target_users: ['user_B', 'user_C']
        };
        const createRes = await request('POST', '/events', eventData);
        console.log('Status:', createRes.status);
        console.log('Response:', createRes.body);
        if (createRes.status !== 201) throw new Error('Failed to create event');

        // 2. Get Feed for User B
        console.log('\n--- Test: Get Feed (User B) ---');
        const feedRes = await request('GET', '/feed?user_id=user_B');
        console.log('Status:', feedRes.status);
        console.log('Feed Length:', Array.isArray(feedRes.body) ? feedRes.body.length : 'Not Array');
        if (feedRes.status !== 200) throw new Error('Failed to get feed');

        // 3. Get Notifications for User C
        console.log('\n--- Test: Get Notifications (User C) ---');
        const notifRes = await request('GET', '/notifications?user_id=user_C');
        console.log('Status:', notifRes.status);
        console.log('Notifications Length:', Array.isArray(notifRes.body) ? notifRes.body.length : 'Not Array');
        if (notifRes.status !== 200) throw new Error('Failed to get notifications');

        // 4. Get Analytics
        console.log('\n--- Test: Get Analytics ---');
        const analyticsRes = await request('GET', '/top');
        console.log('Status:', analyticsRes.status);
        console.log('Body:', analyticsRes.body);
        if (analyticsRes.status !== 200) throw new Error('Failed to get analytics');

        console.log('\nVerification Passed! ✅');
    } catch (err) {
        console.error('\nVerification Failed ❌');
        console.error(err);
    }
};

// Wait for server to potentially start if running locally, though this script assumes server is up
setTimeout(runVerification, 1000);
