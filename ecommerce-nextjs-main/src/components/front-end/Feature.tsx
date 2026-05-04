import { MdSupportAgent } from "react-icons/md";
import { RiRefund2Fill } from "react-icons/ri";
import { TbDiscount, TbTruckDelivery } from "react-icons/tb";
import FeatureCard from "./FeatureCard";

const data = [
  {
    icon: <TbTruckDelivery />,
    title: "Free Delivery",
    desc: "On all orders over $49",
  },
  {
    icon: <RiRefund2Fill />,
    title: "30-Day Returns",
    desc: "Hassle-free money-back guarantee",
  },
  {
    icon: <TbDiscount />,
    title: "Member Discounts",
    desc: "Exclusive deals on orders over $99",
  },
  {
    icon: <MdSupportAgent />,
    title: "24/7 Support",
    desc: "Get help whenever you need it",
  },
];

const Feature = () => {
  return (
    <section className="container py-12">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((item) => (
          <FeatureCard key={item.title} icon={item.icon} title={item.title} desc={item.desc} />
        ))}
      </div>
    </section>
  );
};

export default Feature;
