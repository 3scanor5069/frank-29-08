// src/components/FeaturedMenu.js
import React from 'react';
import '../styles/FeaturedMenu.css';

const menuItems = [
  {
    id: 1,
    title: 'Salmon a la parrilla ',
    description: 'Salmón fresco del Atlántico servido con verduras.',
    price: '$30.000',
    image: 'https://kasani.pe/wp-content/uploads/2020/08/SALMON-A-LA-PARRILLA.jpg',
  },
  {
    id: 2,
    title: 'Pollo Alfredo',
    description: 'Pasta cremosa con pechuga de pollo a la plancha.',
    price: '$15.500',
    image: 'https://www.recetasnestlecam.com/sites/default/files/srh_recipes/2face93eead8f917c911d544f5d32744.jpg',
  },
  {
    id: 3,
    title: 'Hamburguesa vegetariana',
    description: 'Hamburguesa a base de plantas con aguacate y patatas fritas de boniato.',
    price: '$12.700',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtACaSxt-DcemtaLB2WxOEsbFNWjJ9iZ2Yfg&s',
  },
  {
    id: 4,
    title: 'Costillas BBQ',
    description: 'Costillas cocinadas a fuego lento y glaseadas con salsa barbacoa.',
    price: '$20.000',
    image: 'https://cdn0.uncomo.com/es/posts/3/9/5/como_hacer_costillas_bbq_en_sarten_50593_orig.jpg',
  },
];

const FeaturedMenu = () => {
  return (
    <section className="featured-menu">
      <h2>Platos Destacados</h2>
      <div className="menu-grid">
        {menuItems.map((item) => (
          <div className="menu-card" key={item.id}>
            <img src={item.image} alt={item.title} />
            <div className="menu-info">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span className="price">{item.price}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedMenu;
