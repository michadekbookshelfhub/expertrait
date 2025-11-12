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

import UserDashboard from "./UserDashboard";

import HandlerDashboard from "./HandlerDashboard";

import Admin from "./Admin";

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

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/About" element={<About />} />
                
                <Route path="/Services" element={<Services />} />
                
                <Route path="/ServiceDetail" element={<ServiceDetail />} />
                
                <Route path="/Blog" element={<Blog />} />
                
                <Route path="/BlogDetail" element={<BlogDetail />} />
                
                <Route path="/Contact" element={<Contact />} />
                
                <Route path="/Privacy" element={<Privacy />} />
                
                <Route path="/Terms" element={<Terms />} />
                
                <Route path="/Sitemap" element={<Sitemap />} />
                
                <Route path="/SitemapXML" element={<SitemapXML />} />
                
                <Route path="/DownloadApp" element={<DownloadApp />} />
                
                <Route path="/UserDashboard" element={<UserDashboard />} />
                
                <Route path="/HandlerDashboard" element={<HandlerDashboard />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}