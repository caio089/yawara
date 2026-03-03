import { motion } from 'framer-motion'
import { Heart, Target, Users, Globe } from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15 },
  }),
}

const values = [
  {
    icon: Heart,
    title: 'Paixão',
    titleJp: '情熱',
    desc: 'Nascemos da paixão pelo judô e pela cultura japonesa. Cada produto é selecionado com o coração de quem vive o esporte.',
  },
  {
    icon: Target,
    title: 'Excelência',
    titleJp: '卓越',
    desc: 'Buscamos a perfeição em cada detalhe, desde a seleção dos materiais até a entrega ao cliente. Nada menos que o melhor.',
  },
  {
    icon: Users,
    title: 'Comunidade',
    titleJp: 'コミュニティ',
    desc: 'Acreditamos no poder do judô para transformar vidas. Apoiamos atletas e dojos em todo o Brasil.',
  },
  {
    icon: Globe,
    title: 'Tradição',
    titleJp: '伝統',
    desc: 'Honramos a tradição milenar do judô japonês trazendo o autêntico para o Brasil, sem compromissos.',
  },
]

const timeline = [
  {
    year: '2010',
    title: 'O Nascimento',
    desc: 'O mestre Toyo, com mais de 50 anos de experiência no judô, deixa sua marca Toyo nas mãos de seu filho e funda a Yawara Japan na província de Kanagawa, no Japão — uma nova marca carregando toda a tradição e excelência de uma vida dedicada ao judô.',
  },
  {
    year: '2014',
    title: 'Homologação FIJ',
    desc: 'A marca conquista a homologação da FIJ (Federação Internacional de Judô), recebendo o selo oficial nos kimonos — um marco de qualidade e reconhecimento mundial.',
  },
  {
    year: '2025',
    title: 'Chegada à América do Sul',
    desc: 'Ynamoto Sensei fecha parceria para se tornar o responsável oficial da Yawara Japan na América do Sul, trazendo a marca para o Brasil e patrocinando diversos atletas olímpicos brasileiros.',
  },
]

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-sumi pt-28 pb-24 overflow-hidden">

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            src="/images/logo-yawara-cinza.png"
            alt="Yawara Japan"
            className="w-40 sm:w-52 md:w-60 mx-auto mb-8 drop-shadow-[0_0_60px_rgba(255,255,255,0.1)]"
          />
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-kin text-xs tracking-[0.3em] uppercase font-medium"
          >
            Nossa história
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-jp text-4xl sm:text-5xl font-bold text-shiro mt-4 tracking-wide"
          >
            Sobre a Yawara
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-shiro/50 mt-6 max-w-2xl mx-auto leading-relaxed"
          >
            Nascida no Japão em 2010, com mais de 15 anos de tradição e selo da FIJ.
            Hoje presente na América do Sul, vestindo atletas olímpicos brasileiros.
          </motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-shiro relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-kuro flex items-center justify-center p-10">
                  <div className="absolute inset-0 seigaiha-pattern opacity-20" />
                  <motion.img
                    src="/images/logo-yawara-cinza.png"
                    alt="Yawara Japan"
                    className="relative w-full max-w-[280px] drop-shadow-[0_0_40px_rgba(255,255,255,0.08)]"
                    whileInView={{ rotate: [0, 2, -2, 0] }}
                    viewport={{ once: true }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-aka text-shiro p-6 rounded-2xl shadow-xl">
                  <p className="font-jp text-3xl font-bold">15+</p>
                  <p className="text-xs text-shiro/70 mt-1">Anos de tradição</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-aka text-xs tracking-[0.3em] uppercase font-medium">
                Quem somos
              </span>
              <h2 className="text-3xl font-bold text-kuro mt-3 mb-6 leading-snug">
                A arte do judô merece{' '}
                <span className="text-aka">produtos à altura</span>
              </h2>
              <div className="space-y-4 text-kuro/60 text-sm leading-relaxed">
                <p>
                  O mestre Toyo, com mais de 50 anos de experiência no judô, deixou sua marca
                  Toyo nas mãos de seu filho e, em 2010, fundou a Yawara Japan na província de
                  Kanagawa, no Japão. O nome "Yawara" (柔) vem do caractere japonês para
                  "suavidade" — o princípio fundamental do judô.
                </p>
                <p>
                  Em 2014, a marca conquistou a homologação da FIJ (Federação Internacional de Judô),
                  garantindo o selo oficial em seus kimonos — um reconhecimento mundial de qualidade
                  que pouquíssimas marcas no mundo possuem.
                </p>
                <p>
                  Em 2025, Ynamoto Sensei firmou parceria para ser o responsável oficial da
                  Yawara Japan na América do Sul. Hoje a marca patrocina diversos atletas
                  olímpicos do Brasil, sendo referência em produtos autênticos de judô japonês.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-washi relative">
        <div className="absolute inset-0 bg-japanese-pattern" />
        <div className="relative max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-aka text-xs tracking-[0.3em] uppercase font-medium">
              Nossos valores
            </span>
            <h2 className="font-jp text-3xl sm:text-4xl font-bold text-kuro mt-3">
              O que nos move
            </h2>
            <div className="w-12 h-0.5 bg-aka mx-auto mt-4" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, i) => {
              const Icon = val.icon
              return (
                <motion.div
                  key={val.title}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  custom={i}
                  viewport={{ once: true }}
                  className="bg-shiro p-8 rounded-2xl text-center hover:shadow-lg transition-shadow duration-500"
                >
                  <div className="w-14 h-14 mx-auto mb-5 bg-aka/5 rounded-xl flex items-center justify-center">
                    <Icon size={24} className="text-aka" />
                  </div>
                  <h3 className="font-semibold text-kuro mb-1">{val.title}</h3>
                  <p className="text-[10px] font-jp text-kuro/25 tracking-wider mb-3">
                    {val.titleJp}
                  </p>
                  <p className="text-xs text-kuro/50 leading-relaxed">{val.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-kuro text-shiro relative overflow-hidden">
        <div className="absolute inset-0 seigaiha-pattern opacity-10" />
        <div className="relative max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-kin text-xs tracking-[0.3em] uppercase font-medium">
              Nossa trajetória
            </span>
            <h2 className="font-jp text-3xl sm:text-4xl font-bold text-shiro mt-3">
              Linha do Tempo
            </h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-shiro/10" />

            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative pl-20 pb-12 last:pb-0"
              >
                <div className="absolute left-6 top-1 w-5 h-5 rounded-full bg-aka border-4 border-kuro" />
                <span className="text-kin text-xs font-bold tracking-wider">{item.year}</span>
                <h3 className="text-lg font-semibold text-shiro mt-1">{item.title}</h3>
                <p className="text-shiro/40 text-sm mt-2 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-24 bg-washi relative">
        <div className="absolute inset-0 bg-japanese-pattern" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="font-jp text-7xl text-kuro/5 font-black mb-8 select-none">
              精力善用
            </p>
            <h2 className="text-2xl font-bold text-kuro mb-4">
              "Melhor uso da energia"
            </h2>
            <p className="text-kuro/50 leading-relaxed max-w-lg mx-auto">
              Seguimos o princípio de Jigoro Kano: usar a energia da melhor forma possível.
              Em tudo que fazemos, buscamos a máxima eficiência para entregar a você
              a melhor experiência e os melhores produtos.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
