import React from 'react';

function ProductCard({ imageUrl, title, price, reviews, link }) {
  return (
    <div className="product-card">
      <img src={imageUrl} alt={title} />
      <div className="product-info">
          <p className="product-title">{title}</p>
          <p className="product-price">₹{price}<span>/sq.ft.</span></p>
          <p className="product-reviews">{reviews} Reviews</p>
          <a className="view-btn" href={link} target="_blank" rel="noopener noreferrer">View</a>
      </div>
    </div>
  );
}

export default ProductCard; 