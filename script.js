// Google Form URLs
const FORM_URLS = {
    SELL: "https://docs.google.com/forms/d/e/1FAIpQLSfLawoPBdr1NikoulKyGQgm31HMkKtCUMAqs_WNv6cIvJamRA/viewform",
    BUY: "https://docs.google.com/forms/d/e/1FAIpQLSdzGcZ8On8Bnh09sa-pWca7NcLBNOtdrW_hWhiqkWOh0fg3qg/viewform",
    REPORT: "https://docs.google.com/forms/d/e/1FAIpQLSdAh29HyY8GhU5hjC5T0QhUQOJQduURC72Fp-8lYoDXIvatDQ/viewform"
};

// Google Apps Script Web App URL
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyNNYbInI2miE2w5PGmiewwEOwFLcnG2clJPhOpbOzMA3icRFfdHKGXjCYwQ4iyzBA/exec";

// Global variables
let allPosts = [];
let filteredPosts = [];

// Initialize the app when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    loadRealData();
});

// Load real data from Google Sheets
async function loadRealData() {
    try {
        showLoading(true);
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        // Transform data to our format
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
        console.error('Error loading data:', error);
        loadSampleData();
        showLoading(false);
    }
}

// Show loading state
function showLoading(show) {
    const container = document.getElementById('postsContainer');
    if (show) {
        container.innerHTML = '<div class="loading">Loading posts...</div>';
    }
}

// Sample data fallback
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
        }
    ];
    
    updateCityFilter();
    renderPosts(allPosts);
}

// Render posts to page
function renderPosts(posts) {
    const container = document.getElementById('postsContainer');
    
    if (posts.length === 0) {
        container.innerHTML = '<div class="loading">No posts found</div>';
        return;
    }
    
    container.innerHTML = posts.map(post => `
        <div class="post-card">
            <div class="post-header">
                <div class="post-title">${post.title}</div>
                <div class="post-type ${post.type.toLowerCase()}">${post.type}</div>
            </div>
            <div class="post-details">
                <div class="post-meta"><strong>Category:</strong> ${post.category}</div>
                <div class="post-meta"><strong>Quantity:</strong> ${post.quantity} ${post.unit}</div>
                <div class="post-meta"><strong>Rate:</strong> ₹${post.rate} per ${post.unit}</div>
                <div class="post-meta"><strong>City:</strong> ${post.city}</div>
            </div>
            <div class="post-contact">
                <div class="post-meta"><strong>📞 Mobile:</strong> ${post.mobile}</div>
                <div class="post-meta"><strong>✉️ Email:</strong> ${post.email}</div>
            </div>
            <button class="report-btn" onclick="openReportForm('${post.vendor}')">
                Report Fraud/Abuse
            </button>
        </div>
    `).join('');
}

// Filter functions
function toggleFilter() {
    const filterSection = document.getElementById('filterSection');
    if (filterSection.style.display === 'none') {
        filterSection.style.display = 'flex';
    } else {
        filterSection.style.display = 'none';
    }
}

function updateCityFilter() {
    const cities = [...new Set(allPosts.map(post => post.city))];
    const cityFilter = document.getElementById('cityFilter');
    
    cityFilter.innerHTML = '<option value="">All Cities</option>' +
        cities.map(city => `<option value="${city}">${city}</option>`).join('');
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const city = document.getElementById('cityFilter').value;
    const type = document.getElementById('typeFilter').value;
    
    filteredPosts = allPosts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm) ||
                            post.category.toLowerCase().includes(searchTerm);
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

// Modal functions
function openSellForm() {
    document.getElementById('sellForm').src = FORM_URLS.SELL;
    document.getElementById('sellModal').style.display = 'block';
}

function closeSellForm() {
    document.getElementById('sellModal').style.display = 'none';
    document.getElementById('sellForm').src = '';
}

function openBuyForm() {
    document.getElementById('buyForm').src = FORM_URLS.BUY;
    document.getElementById('buyModal').style.display = 'block';
}

function closeBuyForm() {
    document.getElementById('buyModal').style.display = 'none';
    document.getElementById('buyForm').src = '';
}

function openReportForm(vendorName) {
    document.getElementById('reportForm').src = FORM_URLS.REPORT;
    document.getElementById('reportModal').style.display = 'block';
}

function closeReportForm() {
    document.getElementById('reportModal').style.display = 'none';
    document.getElementById('reportForm').src = '';
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        const iframe = event.target.querySelector('iframe');
        if (iframe) iframe.src = '';
    }
};
