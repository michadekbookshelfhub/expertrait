import Layout from "./Layout.jsx";

import Home from "./Home";

import About from "./About";

import Services from "./Services";

import ServiceDetail from "./ServiceDetail";

import Blog from "./Blog";

import BlogDetail from "./BlogDetail";

import Contact from "./Contact";

import Privacy from "./Privacy";

import Terms from "./Terms";

import Sitemap from "./Sitemap";

import SitemapXML from "./SitemapXML";

import DownloadApp from "./DownloadApp";

import UserDashboard from "./UserDashboardNew";

import HandlerDashboard from "./HandlerDashboardNew";

import Admin from "./Admin";

import AdminNew from "./AdminNew";

import PartnerLogin from "./PartnerLogin";

import PartnerDashboard from "./PartnerDashboard";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    About: About,
    
    Services: Services,
    
    ServiceDetail: ServiceDetail,
    
    Blog: Blog,
    
    BlogDetail: BlogDetail,
    
    Contact: Contact,
    
    Privacy: Privacy,
    
    Terms: Terms,
    
    Sitemap: Sitemap,
    
    SitemapXML: SitemapXML,
    
    DownloadApp: DownloadApp,
    
    UserDashboard: UserDashboard,
    
    HandlerDashboard: HandlerDashboard,
    
    Admin: Admin,
    
    PartnerLogin: PartnerLogin,
    
    PartnerDashboard: PartnerDashboard,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Wrapper component for pages that need Layout
function WithLayout({ children }) {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    return <Layout currentPageName={currentPage}>{children}</Layout>;
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    return (
        <Routes>
            {/* Standalone pages (no layout) */}
            <Route path="/Admin" element={<Admin />} />
            <Route path="/admin-dashboard" element={<AdminNew />} />
            <Route path="/partner-login" element={<PartnerLogin />} />
            <Route path="/partner-dashboard" element={<PartnerDashboard />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/handler-dashboard" element={<HandlerDashboard />} />
            
            {/* Pages with Layout */}
            <Route path="/" element={<WithLayout><Home /></WithLayout>} />
            <Route path="/Home" element={<WithLayout><Home /></WithLayout>} />
            <Route path="/About" element={<WithLayout><About /></WithLayout>} />
            <Route path="/Services" element={<WithLayout><Services /></WithLayout>} />
            <Route path="/ServiceDetail" element={<WithLayout><ServiceDetail /></WithLayout>} />
            <Route path="/Blog" element={<WithLayout><Blog /></WithLayout>} />
            <Route path="/BlogDetail" element={<WithLayout><BlogDetail /></WithLayout>} />
            <Route path="/Contact" element={<WithLayout><Contact /></WithLayout>} />
            <Route path="/Privacy" element={<WithLayout><Privacy /></WithLayout>} />
            <Route path="/Terms" element={<WithLayout><Terms /></WithLayout>} />
            <Route path="/Sitemap" element={<WithLayout><Sitemap /></WithLayout>} />
            <Route path="/SitemapXML" element={<WithLayout><SitemapXML /></WithLayout>} />
            <Route path="/DownloadApp" element={<WithLayout><DownloadApp /></WithLayout>} />
        </Routes>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}