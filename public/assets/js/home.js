// Home page logic

document.addEventListener('DOMContentLoaded', async () => {
    if (!requireAuth()) return;
    
    await loadDevices();
    await loadRecentActivities();
    await loadStats();
});

async function loadDevices() {
    try {
        const result = await deviceAPI.list();
        const devicesList = document.getElementById('devicesList');
        
        if (result.devices.length === 0) {
            devicesList.innerHTML = `
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500 text-sm">
                    <i class="bi bi-info-circle"></i> Belum ada device terdaftar. 
                    <a href="/settings.html" class="text-green-600 hover:text-green-700 underline">Daftarkan device</a>
                </div>
            `;
            return;
        }
        
        devicesList.innerHTML = result.devices.map(device => `
            <div class="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="font-semibold text-gray-900 text-sm mb-1">${device.name}</p>
                        <p class="text-xs text-gray-500">${device.device_id}</p>
                    </div>
                    <span class="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Terdaftar</span>
                </div>
            </div>
        `).join('');
        
        document.getElementById('activeDevicesCount').textContent = result.devices.length;
    } catch (error) {
        console.error('Error loading devices:', error);
        document.getElementById('devicesList').innerHTML = `
            <div class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg text-sm">
                Error memuat devices
            </div>
        `;
    }
}

async function loadRecentActivities() {
    try {
        const result = await historyAPI.get(null, null, null, 10);
        const recentActivities = document.getElementById('recentActivities');
        
        if (result.activities.length === 0) {
            recentActivities.innerHTML = `
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500 text-sm">
                    <i class="bi bi-info-circle"></i> Belum ada aktivitas tercatat
                </div>
            `;
            return;
        }
        
        const labelMap = {
            'walking': { text: 'Berjalan', class: 'bg-green-100 text-green-800' },
            'sitting': { text: 'Duduk', class: 'bg-blue-100 text-blue-800' },
            'running': { text: 'Berlari', class: 'bg-red-100 text-red-800' },
            'standing': { text: 'Berdiri', class: 'bg-yellow-100 text-yellow-800' }
        };
        
        recentActivities.innerHTML = result.activities.map(activity => {
            const startTime = new Date(activity.start_ts);
            const duration = ((activity.end_ts - activity.start_ts) / 1000).toFixed(1);
            const labelInfo = labelMap[activity.label] || { text: activity.label, class: 'bg-gray-100 text-gray-800' };
            
            return `
                <div class="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-3">
                            <span class="px-2 py-1 text-xs font-semibold rounded-full ${labelInfo.class}">${labelInfo.text}</span>
                            <span class="text-xs text-gray-500">${startTime.toLocaleString('id-ID')}</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-xs text-gray-600">${duration}s</span>
                            <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">${(activity.confidence * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading activities:', error);
    }
}

async function loadStats() {
    try {
        const result = await historyAPI.get(null, null, null, 10000);
        const activities = result.activities;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTs = today.getTime();
        
        const todayActivities = activities.filter(a => a.start_ts >= todayTs);
        
        document.getElementById('totalActivitiesCount').textContent = activities.length;
        document.getElementById('todayActivitiesCount').textContent = todayActivities.length;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}



