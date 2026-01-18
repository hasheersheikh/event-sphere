import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Category } from "@/types/event";

interface CategoryCardProps {
  category: Category;
  index?: number;
}

const CategoryCard = ({ category, index = 0 }: CategoryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        to={`/events?category=${encodeURIComponent(category.name)}`}
        className="group block"
      >
        <div className="relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-card-hover transition-all duration-300 text-center">
          <div className="text-4xl mb-3">{category.icon}</div>
          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
            {category.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {category.count} events
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
