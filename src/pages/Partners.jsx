import { motion } from 'framer-motion'
import { Trophy, Medal, Users, ExternalLink } from 'lucide-react'

const athletes = [
  {
    name: 'Rafael Takahashi',
    nameJp: '高橋ラファエル',
    title: 'Campeão Brasileiro Sênior',
    category: '-73kg',
    image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop&crop=face',
    achievements: ['Ouro no Grand Slam de Tóquio 2025', 'Bicampeão Brasileiro', 'Pan-Americano — Prata'],
  },
  {
    name: 'Yuki Fernandes',
    nameJp: 'フェルナンデス ユキ',
    title: 'Seleção Brasileira Feminina',
    category: '-57kg',
    image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=400&fit=crop&crop=face',
    achievements: ['Mundial Júnior — Bronze', 'Campeã Sul-Americana', 'Grand Prix de Zagreb — Ouro'],
  },
  {
    name: 'Pedro Yamamoto',
    nameJp: '山本ペドロ',
    title: 'Promessa Olímpica 2028',
    category: '-81kg',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    achievements: ['Campeão Mundial Sub-21', 'Ouro nos Jogos Pan-Americanos', 'Ranking IJF — Top 15'],
  },
  {
    name: 'Ana Katayama',
    nameJp: '片山アナ',
    title: 'Veterana — Lenda do Judô',
    category: '-63kg',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
    achievements: ['Medalhista Olímpica', '5x Campeã Brasileira', 'Embaixadora do Judô Feminino'],
  },
]

const partners = [
  {
    name: 'Confederação Brasileira de Judô',
    nameJp: 'ブラジル柔道連盟',
    description: 'Parceiro oficial na promoção e desenvolvimento do judô brasileiro.',
    image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=300&h=200&fit=crop',
  },
  {
    name: 'Academia Bushido São Paulo',
    nameJp: '武士道アカデミー',
    description: 'Centro de treinamento de elite com mais de 200 atletas competidores.',
    image: 'https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=300&h=200&fit=crop',
  },
  {
    name: 'Projeto Social Judô Para Todos',
    nameJp: '柔道フォーオール',
    description: 'Levando o judô e seus valores para comunidades em todo o Brasil.',
    image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=300&h=200&fit=crop',
  },
  {
    name: 'Kodokan International',
    nameJp: '講道館',
    description: 'Berço do judô mundial. Parceria direta para importação de produtos.',
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=300&h=200&fit=crop',
  },
]

const stats = [
  { icon: Trophy, value: '12+', label: 'Atletas Patrocinados' },
  { icon: Medal, value: '45+', label: 'Medalhas Conquistadas' },
  { icon: Users, value: '8', label: 'Parceiros Oficiais' },
]

export default function Partners() {
  return (
    <div className="min-h-screen">
      <section className="relative bg-kuro pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 seigaiha-pattern opacity-15" />
        <div className="relative max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-kin text-xs tracking-[0.3em] uppercase font-medium">
              Time Yawara
            </span>
            <h1 className="font-jp text-4xl sm:text-5xl font-bold text-shiro mt-3 tracking-wide">
              Patrocinados & Parceiros
            </h1>
            <p className="text-shiro/40 mt-3 max-w-lg text-sm leading-relaxed">
              Orgulho de vestir os maiores atletas e apoiar as melhores instituições
              do judô brasileiro e mundial.
            </p>
          </motion.div>

          <div className="flex gap-8 mt-12">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-shiro/5 flex items-center justify-center">
                    <Icon size={18} className="text-kin" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-shiro">{stat.value}</p>
                    <p className="text-[10px] text-shiro/40 uppercase tracking-wider">{stat.label}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-shiro">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-aka text-xs tracking-[0.3em] uppercase font-medium">
              Atletas
            </span>
            <h2 className="font-jp text-3xl sm:text-4xl font-bold text-kuro mt-3 tracking-wide">
              Nossos Patrocinados
            </h2>
            <div className="w-12 h-0.5 bg-aka mx-auto mt-4" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {athletes.map((athlete, i) => (
              <motion.div
                key={athlete.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group bg-shiro rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-washi-dark transition-all duration-500"
              >
                <div className="relative overflow-hidden aspect-square">
                  <img
                    src={athlete.image}
                    alt={athlete.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-kuro/80 via-kuro/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block bg-aka text-shiro text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2">
                      {athlete.category}
                    </span>
                    <h3 className="text-lg font-bold text-shiro leading-tight">{athlete.name}</h3>
                    <p className="text-[10px] font-jp text-shiro/50 tracking-wider">{athlete.nameJp}</p>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs font-medium text-aka mb-3">{athlete.title}</p>
                  <ul className="space-y-1.5">
                    {athlete.achievements.map((a) => (
                      <li key={a} className="flex items-start gap-2 text-xs text-kuro/50">
                        <Medal size={12} className="text-kin shrink-0 mt-0.5" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-kuro relative overflow-hidden">
        <div className="absolute inset-0 seigaiha-pattern opacity-10" />
        <div className="relative max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-kin text-xs tracking-[0.3em] uppercase font-medium">
              Juntos somos mais fortes
            </span>
            <h2 className="font-jp text-3xl sm:text-4xl font-bold text-shiro mt-3 tracking-wide">
              Parceiros Oficiais
            </h2>
            <div className="w-12 h-0.5 bg-kin mx-auto mt-4" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {partners.map((partner, i) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group bg-shiro/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-shiro/10 hover:border-kin/30 transition-all duration-500"
              >
                <div className="relative overflow-hidden h-36">
                  <img
                    src={partner.image}
                    alt={partner.name}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-kuro to-transparent" />
                </div>

                <div className="p-5">
                  <h3 className="text-sm font-bold text-shiro mb-0.5 flex items-center gap-2">
                    {partner.name}
                    <ExternalLink size={12} className="text-shiro/30" />
                  </h3>
                  <p className="text-[10px] font-jp text-shiro/30 tracking-wider mb-3">
                    {partner.nameJp}
                  </p>
                  <p className="text-xs text-shiro/50 leading-relaxed">{partner.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-washi relative">
        <div className="absolute inset-0 bg-japanese-pattern" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl sm:text-2xl font-bold text-kuro mb-3">
              Quer fazer parte do Time Yawara?
            </h3>
            <p className="text-kuro/50 text-sm mb-8 max-w-md mx-auto leading-relaxed">
              Se você é atleta, academia ou projeto social e quer se tornar nosso parceiro,
              entre em contato conosco.
            </p>
            <a
              href="mailto:contato@yawara.com.br"
              className="inline-flex items-center gap-2 bg-aka hover:bg-aka-light text-shiro px-8 py-4 rounded-full font-medium shadow-lg shadow-aka/20 transition-all duration-300 text-sm tracking-wide"
            >
              Entrar em Contato
              <ExternalLink size={16} />
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
