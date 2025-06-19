import React, { useState } from 'react';
import './App.css'; // Ensure App.css is imported
import Header from './components/Header'; // Import the Header component
import Sidebar from './components/Sidebar'; // Import the Sidebar component
import Chatbot from './components/Chatbot'; // Import the Chatbot component
import ProductCard from './components/ProductCard'; // Import the ProductCard component
import Footer from './components/Footer'; // Import the Footer component

const STEP_LABELS = [
  'Tile Type',
  'Area Input',
  'Tile Size',
  'Calculation & Result',
  'Suggestions'
];

function App() {
  // Static product data for demonstration
  const products = [
    {
      imageUrl: "https://arqonz.com/static/images/Product_IMAGES/Image/Tiles/2/1.jpeg",
      title: "Somany Duragres Grande Valor Breccia Grey FP Glossy 1200 mm x 600 mm GVT Tile",
      price: "70",
      reviews: "24",
      link: "https://arqonz.com/products/2"
    },
    {
      imageUrl: "https://arqonz.com/static/images/Product_IMAGES/Image/Tiles/3/1.jpeg",
      title: "Bronze Tropic White Glossy 600 mm x 600 mm Double Charged Tile",
      price: "42",
      reviews: "24",
      link: "https://arqonz.com/products/3"
    },
    {
      imageUrl: "https://arqonz.com/static/images/Product_IMAGES/Image/Tiles/4/1.jpeg",
      title: "Kajaria Eternity Tresor Gris Glossy 1200 mm x 600 mm GVT Tile",
      price: "72",
      reviews: "24",
      link: "https://arqonz.com/products/4"
    },
    {
      imageUrl: "https://arqonz.com/static/images/Product_IMAGES/Image/Tiles/5/1.jpeg",
      title: "Sunhearrt Elapse White Matte 600 mm x 600 mm GVT Tile",
      price: "49",
      reviews: "24",
      link: "https://arqonz.com/products/5"
    },
    {
      imageUrl: "https://arqonz.com/static/images/Product_IMAGES/Image/Tiles/6/1.jpeg",
      title: "Kajaria Eternity Timber Rose Wood Matte 1200 mm x 600 mm GVT Tile",
      price: "72",
      reviews: "24",
      link: "https://arqonz.com/products/6"
    },
    {
      imageUrl: "https://arqonz.com/static/images/Product_IMAGES/Image/Tiles/7/1.jpeg",
      title: "Somany Duragres Strio Valor Argent Wood Ash Matte 1200 mm x 196 mm GVT Tile",
      price: "90",
      reviews: "24",
      link: "https://arqonz.com/products/7"
    },
    {
      imageUrl: "https://arqonz.com/static/images/Product_IMAGES/Image/Tiles/8/1.jpeg",
      title: "Kajaria Eternity Inferno Bronze Glossy 1200 mm x 600 mm GVT Tile",
      price: "82",
      reviews: "24",
      link: "https://arqonz.com/products/8"
    },
    {
      imageUrl: "https://arqonz.com/static/images/Product_IMAGES/Image/Tiles/9/1.jpeg",
      title: "Somany Duragres Valor Amsterdam FP Glossy 600 mm x 600 mm GVT Tile",
      price: "63",
      reviews: "24",
      link: "https://arqonz.com/products/9"
    },
    {
      imageUrl: "https://arqonz.com/static/images/Product_IMAGES/Image/Tiles/10/1.jpeg",
      title: "Somany Duragres Grande Valor Glaicer White FP Glossy 1200 mm x 600 mm GVT Tile",
      price: "70",
      reviews: "24",
      link: "https://arqonz.com/products/10"
    },
    {
      imageUrl: "https://arqonz.com/static/images/Product_IMAGES/Image/Tiles/11/1.jpeg",
      title: "Shreeji Smooth Staturio Glossy 1200 mm x 600 mm GVT Tile",
      price: "51",
      reviews: "24",
      link: "https://arqonz.com/products/11"
    },
    {
      imageUrl: "https://arqonz.com/static/images/Product_IMAGES/Image/Tiles/12/1.jpeg",
      title: "Kajaria Eternity Silvia Glossy 1200 mm x 600 mm GVT Tile",
      price: "72",
      reviews: "24",
      link: "https://arqonz.com/products/12"
    },
    {
      imageUrl: "https://arqonz.com/static/images/Product_IMAGES/Image/Tiles/13/1.jpeg",
      title: "Kajaria Eternity Kashmir Marfil Glossy 600 mm x 600 mm GVT Tile",
      price: "66",
      reviews: "24",
      link: "https://arqonz.com/products/13"
    },
  ];

  // Step state for progress bar and chatbot
  const [currentStep, setCurrentStep] = useState(1); // 1-based step

  return (
    <div className="App">
      <Header />

      <main className="main-content">
        <Sidebar />
        <Chatbot products={products} currentStep={currentStep} setCurrentStep={setCurrentStep} />
      </main>

      <section className="related-products-section">
        <h2>Related Products</h2>
        <div className="product-grid">
          {products.map((product, index) => (
            <ProductCard
              key={index}
              imageUrl={product.imageUrl}
              title={product.title}
              price={product.price}
              reviews={product.reviews}
              link={product.link}
            />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default App;
