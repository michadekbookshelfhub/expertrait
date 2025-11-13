import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Enhanced services with 150-word descriptions and images
enhanced_services = [
    # Additional services for existing categories
    {
        "category": "Cleaning",
        "name": "Move-In/Move-Out Cleaning",
        "description": "Our comprehensive move-in/move-out cleaning service ensures your new or former home is spotless. We thoroughly clean every room, including kitchen appliances, bathroom fixtures, windows, and floors. Our experienced team pays attention to detail, reaching areas often overlooked. We use eco-friendly products safe for families and pets. Perfect for landlords preparing properties for new tenants or homeowners wanting to leave their space pristine. Services include cabinet cleaning, baseboard wiping, light fixture dusting, and more. We work efficiently to meet move-in/out deadlines while maintaining quality standards. Our satisfaction guarantee means we'll return if you're not completely happy. Trust our professionals to handle this stressful task, allowing you to focus on your move. Book today for a fresh start!",
        "fixed_price": 200.0,
        "estimated_duration": 240,
        "image_url": "https://images.unsplash.com/photo-1686178827149-6d55c72d81df?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxjbGVhbmluZyUyMHNlcnZpY2V8ZW58MHx8fHwxNzYyOTkzMzEyfDA&ixlib=rb-4.1.0&q=85&w=400"
    },
    {
        "category": "Plumbing",
        "name": "Garbage Disposal Installation",
        "description": "Professional garbage disposal installation service for your kitchen sink. Our licensed plumbers handle the entire process from selecting the right unit for your needs to complete installation and testing. We ensure proper electrical connections, mounting, and plumbing hookups for optimal performance. Whether replacing an old unit or installing your first disposal, we guarantee leak-free operation. Our team explains maintenance tips and proper usage to extend your disposal's lifespan. We work with major brands and can recommend the best model for your household size and cooking habits. All installations include disposal of your old unit and thorough cleanup. We test water flow and grinding functionality before completing the job. Your satisfaction is guaranteed with our professional workmanship. Enjoy a cleaner, more efficient kitchen today!",
        "fixed_price": 180.0,
        "estimated_duration": 90,
        "image_url": "https://images.pexels.com/photos/4239035/pexels-photo-4239035.jpeg?w=400"
    },
    {
        "category": "Electrical",
        "name": "Smart Home Device Setup",
        "description": "Transform your house into a smart home with our expert device installation and setup service. We install and configure smart thermostats, doorbells, security cameras, lighting systems, and voice assistants. Our technicians ensure all devices connect properly to your home network and work seamlessly together. We provide comprehensive training on using your new smart devices through their apps and voice commands. Whether you're starting your smart home journey or expanding existing systems, we handle the technical complexities. We troubleshoot connectivity issues and optimize settings for your preferences. Our service includes integration with popular platforms like Alexa, Google Home, and Apple HomeKit. We ensure secure network configurations to protect your privacy. All installations meet electrical codes and safety standards. Experience convenience and energy savings with professional smart home setup today!",
        "fixed_price": 150.0,
        "estimated_duration": 120,
        "image_url": "https://images.unsplash.com/photo-1505798577917-a65157d3320a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHw0fHxoYW5keW1hbnxlbnwwfHx8fDE3NjI5OTMzMjJ8MA&ixlib=rb-4.1.0&q=85&w=400"
    },
    {
        "category": "Handyman",
        "name": "Shelf Installation",
        "description": "Professional shelf installation service for any room in your home. Whether you need floating shelves, bracket shelves, or custom built-ins, our experienced handymen ensure secure, level installations. We work with various materials including wood, metal, and glass. Our team assesses wall types to use appropriate anchors and mounting hardware for maximum weight capacity. We bring professional tools for precision measurements and perfect alignment. Services include marking, drilling, mounting, and cleanup. We can install single shelves or complete wall systems. Our experts help determine optimal placement for both functionality and aesthetics. We work carefully to protect your walls and floors during installation. All installations are tested for stability and weight-bearing capacity. Perfect for organizing kitchens, bathrooms, offices, or living spaces. Book today for beautiful, functional storage solutions!",
        "fixed_price": 90.0,
        "estimated_duration": 75,
        "image_url": "https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?w=400"
    },
    {
        "category": "Painting",
        "name": "Cabinet Painting",
        "description": "Revitalize your kitchen or bathroom with professional cabinet painting service. Our experienced painters transform dated cabinets into beautiful, modern focal points. We begin with thorough cleaning and degreasing to ensure proper paint adhesion. All hardware is carefully removed and labeled for easy reinstallation. We fill imperfections, sand surfaces smooth, and apply quality primer. Our multi-coat process uses durable paint formulated specifically for cabinets. We employ professional spraying techniques for smooth, factory-like finishes. Cabinet interiors can be painted or left natural per your preference. We protect your space with drop cloths and careful masking. Our team works efficiently while maintaining meticulous attention to detail. Choose from countless color options to match your style. All work includes proper ventilation and cleanup. Enjoy a kitchen refresh at a fraction of replacement cost. Schedule your transformation today!",
        "fixed_price": 450.0,
        "estimated_duration": 480,
        "image_url": "https://images.unsplash.com/photo-1676311396794-f14881e9daaa?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwzfHxoYW5keW1hbnxlbnwwfHx8fDE3NjI5OTMzMjJ8MA&ixlib=rb-4.1.0&q=85&w=400"
    },
    {
        "category": "Landscaping",
        "name": "Seasonal Cleanup",
        "description": "Comprehensive seasonal yard cleanup service to prepare your outdoor space for changing weather. Our landscaping team tackles spring and fall cleanup tasks efficiently. Services include raking and removing leaves, clearing dead plants and debris, trimming overgrown vegetation, and preparing beds for new plantings. We clean gutters, wash down outdoor furniture, and inspect your yard for winter damage or maintenance needs. Our equipment handles large properties quickly while maintaining care for your plants and lawn. We haul away all debris, leaving your yard pristine. Spring cleanups prepare gardens for growing season, while fall services protect plants for winter. Our professionals identify potential issues with trees, shrubs, or drainage. We can apply mulch, fertilizer, or pre-emergent treatments as needed. All work includes edging, blowing walkways, and final inspection. Keep your property beautiful year-round with seasonal maintenance!",
        "fixed_price": 180.0,
        "estimated_duration": 180,
        "image_url": "https://images.pexels.com/photos/209230/pexels-photo-209230.jpeg?w=400"
    },
    
    # Hair Styling Services - New Category
    {
        "category": "Hair Styling",
        "name": "Precision Haircut",
        "description": "Experience the art of precision haircutting with our expert stylists. We begin with a detailed consultation to understand your desired look, face shape, and lifestyle needs. Our professionals use advanced cutting techniques including layering, texturizing, and point cutting for dimension. We consider hair type, growth patterns, and styling preferences. The service includes shampooing with professional products, conditioning treatment, precision cutting, and blow-dry styling. We teach you how to recreate the look at home with product recommendations. Whether you want a classic cut, trendy style, or complete transformation, we deliver results. Our stylists stay current with latest techniques through continuous education. We use only professional shears and tools for clean, healthy cuts. The experience includes scalp massage, comfortable seating, and refreshments. Leave feeling confident with a haircut that enhances your natural beauty and fits your lifestyle perfectly!",
        "fixed_price": 65.0,
        "estimated_duration": 60,
        "image_url": "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxoYWlyJTIwc2Fsb258ZW58MHx8fHwxNzYyOTkzMjg4fDA&ixlib=rb-4.1.0&q=85&w=400"
    },
    {
        "category": "Hair Styling",
        "name": "Full Color Service",
        "description": "Transform your look with professional hair coloring service. Our experienced colorists create customized formulas to achieve your perfect shade. Whether covering gray, going bold with fashion colors, or subtle highlights, we use premium products that protect hair health. The service begins with consultation and strand testing to ensure desired results. We apply color precisely, timing each step perfectly for even coverage. Our technique minimizes damage while maximizing shine and vibrancy. Choose from permanent, semi-permanent, or demi-permanent options. We can match existing colors, create natural-looking dimension, or completely transform your appearance. All color services include toner application for optimal results. We use bond-building treatments to strengthen hair during coloring. The experience includes shampooing, conditioning, and styling. Our colorists provide maintenance advice and recommend products to extend color life. Walk out with gorgeous, healthy-looking hair that turns heads!",
        "fixed_price": 120.0,
        "estimated_duration": 150,
        "image_url": "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwyfHxoYWlyJTIwc2Fsb258ZW58MHx8fHwxNzYyOTkzMjg4fDA&ixlib=rb-4.1.0&q=85&w=400"
    },
    {
        "category": "Hair Styling",
        "name": "Balayage Highlights",
        "description": "Achieve sun-kissed, natural-looking dimension with our balayage highlighting service. This hand-painted technique creates soft, blended color that grows out beautifully. Our skilled colorists customize placement to complement your features and hair movement. Unlike traditional highlights, balayage offers low-maintenance beauty with seamless regrowth. We use premium lighteners and toners for optimal color and hair health. The process includes consultation, strategic sectioning, freehand painting, and processing time. We incorporate your natural color for dimensional results. Perfect for first-time color clients or those wanting gradual change. The service includes deep conditioning treatment, toning for perfect shade, professional shampooing, and styling. We can go subtle with a few pieces or dramatic with full head placement. Our balayage creates movement and depth while maintaining hair integrity. Receive personalized care advice and product recommendations for lasting results. Experience modern highlighting at its finest!",
        "fixed_price": 200.0,
        "estimated_duration": 180,
        "image_url": "https://images.unsplash.com/photo-1560869713-7d0a29430803?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwzfHxoYWlyJTIwc2Fsb258ZW58MHx8fHwxNzYyOTkzMjg4fDA&ixlib=rb-4.1.0&q=85&w=400"
    },
    {
        "category": "Hair Styling",
        "name": "Deep Conditioning Treatment",
        "description": "Restore your hair's health and shine with our intensive deep conditioning treatment. Perfect for damaged, dry, or color-treated hair needing extra nourishment. We select customized treatment formulas based on your hair's specific needs and condition. Our professional-grade masks penetrate deeply to repair from within. The service begins with clarifying shampoo to remove buildup, allowing maximum treatment absorption. We apply rich conditioning formulas from mid-lengths to ends where hair needs it most. Heat application opens hair cuticles for deeper penetration. Treatment time allows active ingredients to work their magic. We finish with cool water rinse to seal cuticles and lock in moisture. The experience includes scalp massage promoting circulation and relaxation. Your hair emerges incredibly soft, manageable, and glossy. Regular treatments maintain optimal hair health. We recommend maintenance schedules and home care products. Invest in your hair's health and beauty today!",
        "fixed_price": 55.0,
        "estimated_duration": 45,
        "image_url": "https://images.unsplash.com/photo-1595475884562-073c30d45670?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHw0fHxoYWlyJTIwc2Fsb258ZW58MHx8fHwxNzYyOTkzMjg4fDA&ixlib=rb-4.1.0&q=85&w=400"
    },
    {
        "category": "Hair Styling",
        "name": "Keratin Smoothing Treatment",
        "description": "Say goodbye to frizz with our transformative keratin smoothing treatment. This semi-permanent service reduces curl, eliminates frizz, and adds incredible shine for months. Perfect for humid climates or anyone wanting manageable, sleek hair. Our treatment infuses liquid keratin protein into hair structure, sealing the cuticle. The process begins with deep cleansing to remove all buildup. We apply treatment section by section for even coverage. Processing time allows keratin to bond with hair. We blow-dry using tension methods to smooth each strand. Flat ironing at controlled temperatures seals the treatment. Results last 3-5 months depending on hair type and care. Your styling time decreases dramatically with air-dry smoothness. Treatment is customizable from subtle smoothing to super straight. Includes professional shampoo and conditioner to maximize results. We provide detailed aftercare instructions for treatment longevity. Wake up to beautiful hair every day!",
        "fixed_price": 300.0,
        "estimated_duration": 240,
        "image_url": "https://images.pexels.com/photos/3993119/pexels-photo-3993119.jpeg?w=400"
    },
    {
        "category": "Hair Styling",
        "name": "Updo Styling",
        "description": "Look stunning for your special occasion with professional updo styling. Our talented stylists create elegant, secure updos for weddings, proms, parties, or formal events. We begin with consultation, reviewing inspiration photos and your outfit details. Our expertise includes classic chignons, romantic braids, modern twists, and vintage-inspired styles. We consider your hair length, texture, and face shape for most flattering results. The service includes shampooing, blow-drying, and curl or straightening as needed for your chosen style. We use professional techniques ensuring your updo stays perfect all day or night. Strategic pinning and professional products provide long-lasting hold. We can incorporate accessories, flowers, or hair jewelry you provide. Trial runs available for important events. Our stylists work efficiently while creating intricate, beautiful results. We provide touch-up tips and emergency bobby pins. Feel confident and gorgeous for hours. Book your special occasion styling today!",
        "fixed_price": 85.0,
        "estimated_duration": 90,
        "image_url": "https://images.pexels.com/photos/4783264/pexels-photo-4783264.jpeg?w=400"
    },
    {
        "category": "Hair Styling",
        "name": "Blowout and Style",
        "description": "Achieve salon-perfect hair with our signature blowout and styling service. Perfect for special occasions or treating yourself to polished beauty. Our stylists are blow-dry experts, creating volume, smoothness, and movement. We begin with consultation about your desired finish and styling preferences. Professional shampooing removes buildup while conditioning adds shine. We apply heat protectant and volumizing or smoothing products based on your hair type. Using professional tools and techniques, we section and dry each area methodically. Round brushes create volume at roots and smooth ends. Our expertise handles any hair length and texture. Choose from voluminous curls, sleek straight, or natural waves. The finished style lasts days with proper care. We teach simple maintenance techniques for extending your blowout. Our relaxing experience includes head massage and comfortable environment. Walk out feeling confident with gorgeous, bouncy hair. Treat yourself to professional styling excellence!",
        "fixed_price": 50.0,
        "estimated_duration": 60,
        "image_url": "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxoYWlyJTIwc2Fsb258ZW58MHx8fHwxNzYyOTkzMjg4fDA&ixlib=rb-4.1.0&q=85&w=400"
    },
    {
        "category": "Hair Styling",
        "name": "Scalp Treatment",
        "description": "Promote healthy hair growth with our therapeutic scalp treatment. Healthy hair starts with healthy scalp! Our treatment addresses dryness, oiliness, dandruff, or thinning hair concerns. We begin with scalp analysis to identify specific issues and needs. Treatment includes exfoliation to remove dead skin and buildup, allowing follicles to breathe. We apply nourishing serums with vitamins, proteins, and natural oils. Professional massage techniques stimulate blood circulation, promoting nutrient delivery to follicles. The relaxing massage relieves tension while improving scalp health. Treatment products target your specific concerns with clinical-grade formulas. We use steam or warm towels to enhance absorption. The experience includes specialized shampooing and conditioning. Regular treatments improve scalp condition, reduce flaking, and support hair growth. Suitable for all hair types and ages. We recommend treatment frequency based on your needs. Invest in your scalp health for stronger, more beautiful hair!",
        "fixed_price": 70.0,
        "estimated_duration": 60,
        "image_url": "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwyfHxoYWlyJTIwc2Fsb258ZW58MHx8fHwxNzYyOTkzMjg4fDA&ixlib=rb-4.1.0&q=85&w=400"
    },
    {
        "category": "Hair Styling",
        "name": "Hair Extension Application",
        "description": "Add length, volume, or color with professional hair extension application. Our certified extensionists use various methods including tape-in, clip-in, or bonded extensions. We help select extension type, length, and color matching your hair perfectly. Our expertise ensures seamless blending and natural appearance. The consultation includes hair analysis and realistic expectation setting. We source high-quality human hair extensions for authentic look and feel. Application techniques protect your natural hair while providing stunning results. Tape-ins offer semi-permanent wear for 6-8 weeks. Clip-ins provide temporary transformation for special occasions. Bonded extensions deliver long-term length and volume. We cut and style extensions to blend flawlessly. The service includes application, cutting, styling, and care instructions. Learn proper brushing, washing, and sleeping techniques. Extension maintenance appointments keep them looking fresh. Transform your hair instantly with professional extension services. Schedule consultation to discuss your dream hair!",
        "fixed_price": 400.0,
        "estimated_duration": 180,
        "image_url": "https://images.unsplash.com/photo-1560869713-7d0a29430803?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwzfHxoYWlyJTIwc2Fsb258ZW58MHx8fHwxNzYyOTkzMjg4fDA&ixlib=rb-4.1.0&q=85&w=400"
    },
    {
        "category": "Hair Styling",
        "name": "Men's Grooming Service",
        "description": "Comprehensive grooming service designed specifically for modern men. Our expert barbers and stylists provide precision haircuts tailored to your style and profession. We consider face shape, hair texture, and lifestyle for optimal results. The service begins with consultation and style recommendations. We use professional clippers, shears, and razors for clean, sharp lines. Includes detailed work on sideburns, neckline, and facial hair grooming. We can trim, shape, or completely style beards and mustaches. Hot towel treatment opens pores and softens hair for comfortable cutting. Scalp massage relieves tension and improves circulation. Shampooing uses men's grooming products addressing scalp concerns. Styling includes product application and techniques for easy home maintenance. We recommend products suited to your hair type and style. Our comfortable, masculine environment provides relaxing experience. Regular grooming maintains professional appearance. Book ongoing appointments for consistent, polished look. Experience premium men's grooming today!",
        "fixed_price": 45.0,
        "estimated_duration": 45,
        "image_url": "https://images.unsplash.com/photo-1595475884562-073c30d45670?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHw0fHxoYWlyJTIwc2Fsb258ZW58MHx8fHwxNzYyOTkzMjg4fDA&ixlib=rb-4.1.0&q=85&w=400"
    },
    
    # Therapy/Massage Services - New Category
    {
        "category": "Therapy",
        "name": "Swedish Massage",
        "description": "Experience ultimate relaxation with our signature Swedish massage therapy. This classic technique uses long, flowing strokes to release tension and promote overall well-being. Our certified massage therapists customize pressure from light to firm based on your preferences. The session begins with consultation about areas of concern and comfort levels. We use premium massage oils with optional aromatherapy enhancement. Swedish massage improves circulation, reduces muscle tension, and promotes deep relaxation. Techniques include effleurage, petrissage, and gentle stretching. Perfect for stress relief, better sleep, and general wellness. Our tranquil environment features comfortable heated tables, soft lighting, and calming music. Each session flows smoothly from head to toe, addressing all major muscle groups. We focus extra attention on problem areas like shoulders, back, and neck. The experience leaves you feeling refreshed, centered, and peaceful. Suitable for massage beginners and regular therapy clients. Book your escape from daily stress today!",
        "fixed_price": 95.0,
        "estimated_duration": 60,
        "image_url": "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwxfHxtYXNzYWdlJTIwdGhlcmFweXxlbnwwfHx8fDE3NjI5OTMyOTd8MA&ixlib=rb-4.1.0&q=85&w=400"
    },
    {
        "category": "Therapy",
        "name": "Deep Tissue Massage",
        "description": "Target chronic muscle tension with our therapeutic deep tissue massage. Our experienced therapists use firm pressure and slow strokes to reach deeper muscle layers and fascia. Ideal for chronic pain, sports injuries, or persistent muscle knots. We begin with assessment of problem areas and pain tolerance discussion. Techniques include stripping, friction, and trigger point therapy. Deep tissue massage releases chronic patterns of tension, improving mobility and reducing pain. While more intense than Swedish massage, we work within your comfort zone. Communication throughout ensures optimal pressure levels. The treatment focuses on specific areas like lower back, neck, shoulders, or legs. May cause temporary soreness as toxins release and muscles heal. We recommend hydration post-massage for best results. Perfect for athletes, physical laborers, or anyone with persistent muscle issues. Our skilled therapists understand anatomy and pathology. Experience lasting relief from chronic tension. Transform your body's feel and function!",
        "fixed_price": 110.0,
        "estimated_duration": 60,
        "image_url": "https://images.unsplash.com/photo-1639162906614-0603b0ae95fd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwyfHxtYXNzYWdlJTIwdGhlcmFweXxlbnwwfHx8fDE3NjI5OTMyOTd8MA&ixlib=rb-4.1.0&q=85&w=400"
    },
    {
        "category": "Therapy",
        "name": "Hot Stone Massage",
        "description": "Indulge in the ancient healing art of hot stone massage therapy. Smooth, heated basalt stones are placed on key points and used as massage tools. The heat penetrates deeply, melting away tension and promoting profound relaxation. Our therapists combine stone therapy with traditional massage techniques. We heat stones to perfect temperature for comfort and therapeutic benefit. Placement targets energy centers and tense muscles. The warmth improves circulation, eases muscle stiffness, and calms the nervous system. Stone massage allows deeper muscle work with less pressure. Perfect for cold weather or anyone craving extra warmth and comfort. We use premium massage oils enhanced with essential oils if desired. The experience includes full-body treatment with extended focus on back and shoulders. Stones remain on the body during portions of massage for continuous warmth. Clients often report better sleep and reduced stress after treatment. Our serene environment enhances the therapeutic experience. Treat yourself to luxurious healing warmth!",
        "fixed_price": 130.0,
        "estimated_duration": 75,
        "image_url": "https://images.unsplash.com/photo-1515377905703-c4788e51af15?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHw0fHxtYXNzYWdlJTIwdGhlcmFweXxlbnwwfHx8fDE3NjI5OTMyOTd8MA&ixlib=rb-4.1.0&q=85&w=400"
    },
    {
        "category": "Therapy",
        "name": "Aromatherapy Massage",
        "description": "Enhance your massage experience with the healing power of essential oils. Our aromatherapy massage combines therapeutic touch with carefully selected aromatic plant extracts. We begin with consultation to understand your needs and scent preferences. Choose oils for specific benefits: lavender for relaxation, peppermint for energy, eucalyptus for respiratory support, or custom blends. Essential oils are diluted in carrier oils and applied during Swedish massage techniques. The aromatic molecules affect the limbic system, influencing emotions and stress levels. Inhalation and skin absorption provide dual therapeutic benefits. The massage addresses physical tension while oils calm the mind. Perfect for stress reduction, improved mood, and holistic wellness. Our certified aromatherapist selects pharmaceutical-grade essential oils. The treatment includes full-body massage with emphasis on your concerns. We create a multi-sensory experience with soft music and ambient lighting. Leave feeling balanced mentally, emotionally, and physically. Discover the synergy of touch and scent!",
        "fixed_price": 105.0,
        "estimated_duration": 60,
        "image_url": "https://images.pexels.com/photos/275768/pexels-photo-275768.jpeg?w=400"
    },
    {
        "category": "Therapy",
        "name": "Sports Massage",
        "description": "Optimize your athletic performance with specialized sports massage therapy. Our therapists understand sports-specific muscle use and common injuries. Whether you're training for competition or weekend warrior, we help your body perform its best. The treatment combines various techniques including deep tissue, stretching, and trigger point therapy. We assess movement patterns and identify areas needing attention. Pre-event massage energizes muscles and improves flexibility. Post-event work reduces soreness and speeds recovery. Maintenance sessions prevent injury and enhance performance. We address common issues like IT band syndrome, shin splints, and runner's knee. Techniques include myofascial release, cross-fiber friction, and active stretching. Communication ensures appropriate pressure for your sport and training schedule. The session may include targeted work on specific muscles or full-body treatment. We provide stretching guidance and injury prevention advice. Suitable for all athletic levels and activities. Keep your body in peak condition. Schedule regular sports massage for optimal athletic success!",
        "fixed_price": 115.0,
        "estimated_duration": 60,
        "image_url": "https://images.pexels.com/photos/161477/treatment-finger-keep-hand-161477.jpeg?w=400"
    },
    {
        "category": "Therapy",
        "name": "Prenatal Massage",
        "description": "Experience safe, nurturing massage designed specifically for expectant mothers. Our certified prenatal massage therapists understand pregnancy's unique physical and emotional needs. We use specialized positioning and techniques safe for all trimesters. The massage addresses common pregnancy discomforts including back pain, swollen feet, and hip tension. Side-lying positions with body pillows ensure comfort and safety. We avoid pressure points contraindicated during pregnancy. Gentle techniques reduce swelling, improve circulation, and promote relaxation. The treatment helps prepare the body for labor and delivery. Prenatal massage reduces stress hormones, improving outcomes for mother and baby. We focus on areas of highest tension: lower back, hips, legs, and feet. The experience includes time to discuss concerns and receive positioning advice. Our peaceful environment provides much-needed respite from pregnancy demands. Regular massage throughout pregnancy offers cumulative benefits. Suitable after first trimester with doctor approval. Nurture yourself during this special time. Feel supported, comfortable, and pampered!",
        "fixed_price": 100.0,
        "estimated_duration": 60,
        "image_url": "https://images.unsplash.com/photo-1544843776-7c98a52e08a4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwzfHxzcGElMjB3ZWxsbmVzc3xlbnwwfHx8fDE3NjI5NTAwNTh8MA&ixlib=rb-4.1.0&q=85&w=400"
    },
    {
        "category": "Therapy",
        "name": "Reflexology",
        "description": "Discover the healing power of reflexology, an ancient therapy focusing on pressure points in feet, hands, and ears. These reflex points correspond to organs and body systems. Our certified reflexologists apply precise pressure to stimulate natural healing. The treatment promotes whole-body wellness beyond simple foot massage. We begin with consultation and brief health history. You remain clothed while reclining comfortably in our specialized chair. The therapist works systematically through all reflex zones. Pressure is firm but comfortable, never painful. Reflexology improves circulation, reduces stress, and promotes homeostasis. Clients report improved sleep, digestion, and reduced pain. Some feel tingling or warmth in corresponding body areas. The treatment includes both feet with optional hand reflexology. Each session is deeply relaxing yet energizing. Perfect for those who don't enjoy full-body massage. No oils or lotions required. We provide information about sensitive areas found. Experience this powerful, non-invasive therapy. Feel balanced and renewed!",
        "fixed_price": 75.0,
        "estimated_duration": 45,
        "image_url": "https://images.unsplash.com/photo-1583416750470-965b2707b355?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHw0fHxzcGElMjB3ZWxsbmVzc3xlbnwwfHx8fDE3NjI5NTAwNTh8MA&ixlib=rb-4.1.0&q=85&w=400"
    },
    {
        "category": "Therapy",
        "name": "Thai Massage",
        "description": "Experience the dynamic healing of traditional Thai massage, often called yoga for the lazy. This ancient therapy combines acupressure, stretching, and energy work. Unlike typical massage, Thai work happens on floor mat with you wearing comfortable clothing. Our trained practitioners use hands, feet, elbows, and knees to apply pressure along energy lines. The treatment includes assisted yoga-like stretches improving flexibility and range of motion. Techniques release tension, improve posture, and increase energy flow. The session is interactive, with therapist guiding you through positions. Pressure is rhythmic and meditative, promoting deep relaxation. Thai massage addresses whole body, improving circulation and lymphatic drainage. Perfect for athletes, yoga practitioners, or anyone wanting invigorating bodywork. The treatment leaves you feeling stretched, energized, and mentally clear. We accommodate all flexibility levels and body types. Each session is customized to your needs and abilities. Wear loose, comfortable clothing. Experience this transformative traditional healing art. Discover your body's potential!",
        "fixed_price": 120.0,
        "estimated_duration": 90,
        "image_url": "https://images.pexels.com/photos/17256692/pexels-photo-17256692.jpeg?w=400"
    },
    {
        "category": "Therapy",
        "name": "Couples Massage",
        "description": "Share the gift of relaxation with our couples massage experience. Perfect for partners, friends, or family members wanting to unwind together. Two massage therapists work simultaneously in our specially designed couples suite. Each person receives customized treatment based on individual preferences and needs. Choose from Swedish, deep tissue, aromatherapy, or combination techniques. The shared experience deepens connection while providing therapeutic benefits. Our peaceful environment includes ambient lighting, soft music, and aromatic atmosphere. We coordinate treatments to begin and end together. Services include consultation, massage, and brief relaxation time post-treatment. Perfect for anniversaries, Valentine's Day, or any special occasion. Couples massage provides quality time in today's busy world. Many find it more comfortable than first-time solo massage. We accommodate friends of same or different genders. The experience includes access to spa amenities and refreshments. Create lasting memories while caring for your bodies. Book this intimate, rejuvenating experience today!",
        "fixed_price": 200.0,
        "estimated_duration": 60,
        "image_url": "https://images.pexels.com/photos/15154773/pexels-photo-15154773.jpeg?w=400"
    },
    {
        "category": "Therapy",
        "name": "Chair Massage",
        "description": "Perfect for busy schedules, our chair massage provides targeted relief in less time. This clothed massage focuses on upper body areas holding most tension. Our portable setup works anywhere: offices, events, or our location. You sit in specially designed ergonomic massage chair. The therapist works on neck, shoulders, back, arms, and hands. Techniques include compression, kneading, and trigger point therapy. Chair massage is ideal for workplace wellness programs or event services. No oils or lotions mean no cleanup and you return to activities immediately. The focused treatment effectively reduces tension and improves circulation. Perfect for computer workers, drivers, or anyone with upper body tightness. Sessions range from quick 15-minute sessions to longer 30-minute treatments. We work through clothing, applying appropriate pressure. Great introduction to massage for first-timers. Improves posture, reduces headaches, and increases productivity. Corporate packages available. Experience convenient, effective stress relief. Feel better in minutes!",
        "fixed_price": 35.0,
        "estimated_duration": 30,
        "image_url": "https://images.unsplash.com/photo-1583417267826-aebc4d1542e1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHxzcGElMjB3ZWxsbmVzc3xlbnwwfHx8fDE3NjI5NTAwNTh8MA&ixlib=rb-4.1.0&q=85&w=400"
    },
]

async def seed_enhanced_services():
    print("🌱 Seeding enhanced services with descriptions and images...")
    
    # Count existing services
    existing_count = await db.services.count_documents({})
    print(f"ℹ️  Current services in database: {existing_count}")
    
    inserted = 0
    updated = 0
    
    for service in enhanced_services:
        service["created_at"] = datetime.utcnow()
        
        # Check if service already exists by name
        existing = await db.services.find_one({"name": service["name"]})
        
        if existing:
            # Update existing service with new description and image
            await db.services.update_one(
                {"_id": existing["_id"]},
                {"$set": {
                    "description": service["description"],
                    "image_url": service.get("image_url")
                }}
            )
            updated += 1
        else:
            # Insert new service
            await db.services.insert_one(service)
            inserted += 1
    
    total_count = await db.services.count_documents({})
    print(f"\n✅ Seeding complete!")
    print(f"   - Inserted: {inserted} new services")
    print(f"   - Updated: {updated} existing services")
    print(f"   - Total services now: {total_count}")
    print(f"\n📊 New categories added:")
    print(f"   - Hair Styling: 10 services")
    print(f"   - Therapy: 10 services")

if __name__ == "__main__":
    asyncio.run(seed_enhanced_services())
    client.close()
