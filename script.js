// Replace these with your actual Google Form URLs
const FORM_URLS = {
    SELL: "https://docs.google.com/forms/d/e/1FAIpQLSfLawoPBdr1NikoulKyGQgm31HMkKtCUMAqs_WNv6cIvJamRA/viewform?usp=publish-editor",
    BUY: "https://docs.google.com/forms/d/e/1FAIpQLSdzGcZ8On8Bnh09sa-pWca7NcLBNOtdrW_hWhiqkWOh0fg3qg/viewform?usp=publish-editor", 
    REPORT: "https://docs.google.com/forms/d/e/1FAIpQLSdAh29HyY8GhU5hjC5T0QhUQOJQduURC72Fp-8lYoDXIvatDQ/viewform?usp=publish-editor"
};

// Google Apps Script Web App URL for real data
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyNNYbInI2miE2w5PGmiewwEOwFLcnG2clJPhOpbOzMA3icRFfdHKGXjCYwQ4iyzBA/exec";

// Sample data - In real implementation, this comes from Google Sheets
let allPosts = [];
let filteredPosts = [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadRealData(); // Now loading real data from Google Sheets
});

// Load real data from Google Sheets via Google Apps Script
async function loadRealData() {
    try {
        showLoading(true);
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform the data to match our expected format
        allPosts = data.map(post => ({
            type: post.Type || post.type || 'Sell',
            title: post.Title || post.title || 'No Title',
            category: post.Category || post.category || 'Other',
            quantity: post.Quantity || post.quantity || '0',
            rate: post.Rate || post.rate || '0',
            unit: post.Unit || post.unit || 'Kg',
            city: post.City || post.city || 'Unknown City',
            mobile: post.Mobile || post.mobile || 'Not provided',
            email: post.Email || post.email || 'Not provided',
            timestamp: post.Timestamp || post.timestamp || new Date().toISOString(),
            vendor: post.Vendor || post.vendor || post.Title || 'Unknown Vendor'
        }));
        
        updateCityFilter();
        renderPosts(allPosts);
        showLoading(false);
        
    } catch (error) {
        console.error('Error loading data from Google Sheets:', error);
        // Fallback to sample data if real data fails
        loadSampleData();
        showLoading(false);
    }
}

// Show/hide loading indicator
function showLoading(show) {
    const container = document.getElementById('postsContainer');
    if (show) {
        container.innerHTML = '<div class="loading">Loading posts from database...</div>';
    }
}

// Sample data function - Fallback if real data fails
function loadSampleData() {
    allPosts = [
        {
            type: "Sell",
            title: "Clean Plastic Bottles",
            category: "Plastic",
            quantity: "100",
            rate: "20",
            unit: "Kg",
            city: "Mumbai",
            mobile: "9876543210",
            email: "seller1@example.com",
            timestamp: "2024-01-15",
            vendor: "Raj Sharma"
        },
        {
            type: "Buy", 
            title: "Need Copper Wires",
            category: "Metal",
            quantity: "500",
            rate: "300",
            unit: "Kg",
            city: "Delhi",
            mobile: "9876543211",
            email: "buyer1@example.com",
            timestamp: "2024-01-14",
            vendor: "Amit Kumar"
        },
        {
            type: "Sell",
            title: "Old Newspapers",
            category: "Paper",
            quantity: "200",
            rate: "8",
            unit: "Kg",
            city: "Bangalore",
            mobile: "9876543212",
            email: "seller2@example.com",
            timestamp: "2024-01-16",
            vendor: "Priya Singh"
        }
    ];
    
    updateCityFilter();
    renderPosts(allPosts);
}

// Render posts to the page
function renderPosts(posts) {
    const container = document.getElementById('postsContainer');
    
    if (posts.length === 0) {
        container.innerHTML = '<div class="loading">No posts found matching your filters.</div>';
        return;
    }
    
    container.innerHTML = posts.map(post => `
        <div class="post-card">
            <div class="post-header">
                <div class="post-title">${escapeHtml(post.title)}</div>
                <div class="post-type ${post.type.toLowerCase()}">${post.type}</div>
            </div>
            <div class="post-details">
                <div class="post-meta"><strong>Category:</strong> ${escapeHtml(post.category)}</div>
                <div class="post-meta"><strong>Quantity:</strong> ${escapeHtml(post.quantity)} ${escapeHtml(post.unit)}</div>
                <div class="post-meta"><strong>Rate:</strong> ₹${escapeHtml(post.rate)} per ${escapeHtml(post.unit)}</div>
                <div class="post-meta"><strong>City:</strong> ${escapeHtml(post.city)}</div>
            </div>
            <div class="post-contact">
                <div class="post-meta"><strong>📞 Mobile:</strong> ${escapeHtml(post.mobile)}</div>
                <div class="post-meta"><strong>✉️ Email:</strong> ${escapeHtml(post.email)}</div>
            </div>
            <button class="report-btn" onclick="openReportForm('${escapeHtml(post.vendor)}')">
                Report Fraud/Abuse
            </button>
        </div>
    `).join('');
}

// Helper function to escape HTML for security
function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return unsafe
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Filter functions
function toggleFilter() {
    const filterSection = document.getElementById('filterSection');
    filterSection.style.display = filterSection.style.display === 'none' ? 'flex' : 'none';
}

function updateCityFilter() {
    const cities = [...new Set(allPosts.map(post => post.city))].filter(city => city && city !== 'Unknown City');
    const cityFilter = document.getElementById('cityFilter');
    
    cityFilter.innerHTML = '<option value="">All Cities</option>' +
        cities.map(city => `<option value="${escapeHtml(city)}">${escapeHtml(city)}</option>`).join('');
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const city = document.getElementById('cityFilter').value;
    const type = document.getElementById('typeFilter').value;
    
    filteredPosts = allPosts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm) ||
                            post.category.toLowerCase().includes(searchTerm) ||
                            post.city.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || post.category === category;
        const matchesCity = !city || post.city === city;
        const matchesType = !type || post.type === type;
        
        return matchesSearch && matchesCategory && matchesCity && matchesType;
    });
    
    renderPosts(filteredPosts);
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('cityFilter').value = '';
    document.getElementById('typeFilter').value = '';
    renderPosts(allPosts);
}

// Refresh data function - add a refresh button to your HTML if needed
function refreshData() {
    loadRealData();
}

// Modal functions
function openSellForm() {
    document.getElementById('sellForm').src = FORM_URLS.SELL;
    document.getElementById('sellModal').style.display = 'block';
}

function closeSellForm() {
    document.getElementById('sellModal').style.display = 'none';
    document.getElementById('sellForm').src = '';
    // Refresh data after form submission (optional)
    setTimeout(loadRealData, 2000);
}

function openBuyForm() {
    document.getElementById('buyForm').src = FORM_URLS.BUY;
    document.getElementById('buyModal').style.display = 'block';
}

function closeBuyForm() {
    document.getElementById('buyModal').style.display = 'none';
    document.getElementById('buyForm').src = '';
    // Refresh data after form submission (optional)
    setTimeout(loadRealData, 2000);
}

function openReportForm(vendorName) {
    // For Google Forms, we need the actual entry ID for the vendor field
    // Since we don't have the exact entry ID, we'll open the form without pre-fill
    document.getElementById('reportForm').src = FORM_URLS.REPORT;
    document.getElementById('reportModal').style.display = 'block';
}

function closeReportForm() {
    document.getElementById('reportModal').style.display = 'none';
    document.getElementById('reportForm').src = '';
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = ['sellModal', 'buyModal', 'reportModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.style.display = 'none';
            document.getElementById(modalId.replace('Modal', 'Form')).src = '';
        }
    });
}

// Add refresh button to header (optional enhancement)
// You can add this button to your HTML header later
function addRefreshButton() {
    const headerButtons = document.querySelector('.header-buttons');
    if (headerButtons && !document.querySelector('.refresh-btn')) {
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'refresh-btn';
        refreshBtn.innerHTML = '🔄';
        refreshBtn.title = 'Refresh Posts';
        refreshBtn.onclick = refreshData;
        headerButtons.appendChild(refreshBtn);
    }
}

// Initialize refresh button when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addRefreshButton, 1000);
});