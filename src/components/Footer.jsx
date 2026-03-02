import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="bg-kuro text-shiro/60 relative overflow-hidden">
      <div className="absolute inset-0 seigaiha-pattern opacity-20 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-jp text-2xl text-shiro font-bold tracking-wider mb-2">
              YAWARA
            </h3>
            <p className="text-kin text-xs font-jp tracking-[0.3em] mb-4">柔JAPAN</p>
            <p className="text-sm leading-relaxed text-shiro/40">
              Produtos autênticos de judô importados diretamente do Japão.
              Qualidade, tradição e excelência em cada peça.
            </p>
          </div>

          <div>
            <h4 className="text-shiro font-medium mb-4 text-sm tracking-wider uppercase">
              Navegação
            </h4>
            <ul className="space-y-3 text-sm">
              {['Home', 'Catálogo', 'Sobre Nós', 'Carrinho'].map((item) => (
                <li key={item}>
                  <span className="hover:text-kin transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-shiro font-medium mb-4 text-sm tracking-wider uppercase">
              Contato
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="https://instagram.com/yawara_japan_brazil" target="_blank" rel="noopener noreferrer" className="hover:text-kin transition-colors">
                  Instagram @yawara_japan_brazil
                </a>
              </li>
              <li>
                <a href="https://wa.me/5511972224780" target="_blank" rel="noopener noreferrer" className="hover:text-kin transition-colors">
                  (11) 97222-4780
                </a>
                <span className="block text-shiro/50 text-xs mt-0.5">Atendimento: 8h às 18h (Brasília)</span>
              </li>
              <li>
                <a href="https://wa.me/818036448596" target="_blank" rel="noopener noreferrer" className="hover:text-kin transition-colors">
                  +81 80 3644-8596
                </a>
                <span className="block text-shiro/50 text-xs mt-0.5">Atendimento: 18h às 8h (Brasília) / Japão</span>
              </li>
            </ul>
          </div>
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="h-px bg-gradient-to-r from-transparent via-aka to-transparent my-12"
        />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-shiro/30">
          <p>© 2026 Yawara. Todos os direitos reservados.</p>
          <p className="font-jp tracking-[0.2em]">精力善用 — 自他共栄</p>
        </div>
      </div>
    </footer>
  )
}
