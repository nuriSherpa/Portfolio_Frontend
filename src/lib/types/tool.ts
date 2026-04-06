// Tool models
export type Tool = {
  _id: string; // Unique identifier (e.g., MongoDB ObjectId)
  id: string;
  name: string;
  description: string;
  icon: string; // URL or icon name
  category: string; // e.g., "AI", "Productivity", "Design"
  url: string; // Link to the tool's website
  features: string[]; // List of key features
  pricing: string; // Pricing information (e.g., "Free", "$10/month")
  rating: number; // Average user rating (1-5)
};

export type ToolCategory = {
  name: string;
  tools: Tool[];
};
