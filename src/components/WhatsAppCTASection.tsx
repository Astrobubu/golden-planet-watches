import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/";

export function WhatsAppCTASection() {
  return (
    <section className="py-24 bg-background">
      <div className="container max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="border border-gold/20 bg-surface-elevated/50 p-10 md:p-14 text-center"
        >
          <p className="font-sans text-[10px] font-medium tracking-[0.4em] uppercase text-gold/60 mb-3">
            Stay Connected
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-gold-gradient mb-4">
            Join Our Community
          </h2>
          <p className="font-sans text-sm text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
            Get early access to new arrivals, exclusive offers, and connect with fellow collectors.
          </p>
          <a
            href={WHATSAPP_COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-gold text-primary-foreground font-sans text-xs font-semibold tracking-[0.25em] uppercase px-10 py-4 transition-all duration-300 hover:bg-gold-light"
          >
            <MessageCircle className="w-5 h-5" />
            Join on WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}
