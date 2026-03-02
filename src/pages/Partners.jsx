import { motion } from 'framer-motion'
import { Trophy, Medal, Users, ExternalLink, Star, Camera } from 'lucide-react'

const ambassador = {
  name: 'Rafaela Silva',
  role: 'Embaixadora',
  description: 'Campeã Olímpica e Bicampeã Mundial, Rafaela Silva é a embaixadora oficial da Yawara Japan. Ela representa a força, a garra e a excelência do judô brasileiro no mundo.',
  image: '/images/rafaela-silva.png',
}

const sponsored = [
  {
    name: 'Guilherme Oliveira',
    role: 'Patrocinado',
    image: '/images/guilherme-oliveira.png',
  },
  {
    name: 'Rafael Macedo',
    role: 'Patrocinado',
    image: '/images/rafael-macedo.png',
  },
  {
    name: 'Alana Maldonado',
    role: 'Patrocinada',
    image: '/images/alana-maldonado.png',
  },
  {
    name: 'Marcelo Vicentini',
    role: 'Patrocinado',
    image: '/images/marcelo-vicinittji.png',
  },
  {
    name: 'Sarah Mendes',
    role: 'Patrocinada',
    image: '/images/sarah-mendes.png',
  },
  {
    name: 'Stanley Torres',
    role: 'Patrocinado',
    image: '/images/stanley-torres.png',
  },
]

const partners = [
  {
    name: 'Thiago Camilo',
    role: 'Amigo da Marca',
    image: '/images/thiago-camilo.png',
  },
  {
    name: 'Chrystian Silva',
    role: 'Parceiro',
    image: '/images/chrystian-silva.png',
  },
  {
    name: 'João Derly',
    role: 'Parceiro',
    image: '/images/joao-derly.png',
  },
  {
    name: 'Thiago dos Remédios',
    role: 'Parceiro',
    image: '/images/thiago-remedios.png',
  },
  {
    name: 'Moacir Mendes',
    role: 'Parceiro',
    image: '/images/moacir-mendes.png',
  },
]

const stats = [
  { icon: Trophy, value: '5', label: 'Patrocinados' },
  { icon: Users, value: '5', label: 'Parceiros' },
  { icon: Star, value: '1', label: 'Embaixadora' },
]

function PersonCard({ person, index, accentColor = 'aka' }) {
  const hasImage = Boolean(person.image)
  const roleColors = {
    Patrocinado: 'bg-aka text-shiro',
    Patrocinada: 'bg-aka text-shiro',
    Parceiro: 'bg-kin text-kuro',
    Embaixadora: 'bg-gradient-to-r from-kin to-kin-light text-kuro',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="group bg-shiro rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-washi-dark transition-all duration-500"
    >
      <div className="relative overflow-hidden aspect-square bg-washi">
        {hasImage ? (
          <img
            src={person.image}
            alt={person.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-washi-dark flex items-center justify-center">
              <Camera size={24} className="text-kuro/20" />
            </div>
            <p className="text-[10px] text-kuro/25 uppercase tracking-wider">Foto em breve</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-kuro/60 via-transparent to-transparent" />
      </div>

      <div className="p-4 text-center">
        <h3 className="text-sm font-bold text-kuro leading-tight">{person.name}</h3>
      </div>
    </motion.div>
  )
}

export default function Partners() {
  return (
    <div className="min-h-screen">
      {/* HEADER */}
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
              Orgulho de vestir os maiores atletas e apoiar os melhores nomes
              do judô brasileiro e mundial.
            </p>
          </motion.div>

          <div className="flex flex-wrap gap-6 sm:gap-8 mt-12">
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

      {/* EMBAIXADORA */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-washi to-shiro">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="text-kin text-xs tracking-[0.3em] uppercase font-medium">
              Destaque Especial
            </span>
            <h2 className="font-jp text-3xl sm:text-4xl font-bold text-kuro mt-3 tracking-wide">
              Embaixadora Yawara Japan
            </h2>
            <div className="w-12 h-0.5 bg-kin mx-auto mt-4" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-kuro rounded-3xl overflow-hidden shadow-2xl max-w-4xl mx-auto"
          >
            <div className="flex flex-col md:flex-row">
              <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto">
                {ambassador.image ? (
                  <img
                    src={ambassador.image}
                    alt={ambassador.name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-64 md:h-full bg-sumi flex items-center justify-center">
                    <Camera size={48} className="text-shiro/10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-kuro/60 via-transparent to-transparent" />
              </div>

              <div className="relative flex flex-col justify-center p-8 sm:p-10 md:w-1/2">
                <div className="absolute inset-0 seigaiha-pattern opacity-10" />
                <div className="relative">
                  <span className="inline-block bg-gradient-to-r from-kin to-kin-light text-kuro text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">
                    Embaixadora
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-bold text-shiro mb-2">{ambassador.name}</h3>
                  <div className="w-10 h-0.5 bg-kin mb-5" />
                  <p className="text-shiro/50 text-sm leading-relaxed">{ambassador.description}</p>
                  <div className="flex items-center gap-2 mt-6">
                    <Star size={14} className="text-kin" />
                    <span className="text-xs text-kin font-medium uppercase tracking-wider">Campeã Olímpica · Bicampeã Mundial</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PARCEIROS */}
      <section className="py-16 sm:py-20 bg-kuro relative overflow-hidden">
        <div className="absolute inset-0 seigaiha-pattern opacity-10" />
        <div className="relative max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-kin text-xs tracking-[0.3em] uppercase font-medium">
              Juntos somos mais fortes
            </span>
            <h2 className="font-jp text-3xl sm:text-4xl font-bold text-shiro mt-3 tracking-wide">
              Parceiros Oficiais
            </h2>
            <div className="w-12 h-0.5 bg-kin mx-auto mt-4" />
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
            {partners.map((person, i) => (
              <motion.div
                key={person.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group bg-shiro/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-shiro/10 hover:border-kin/30 transition-all duration-500"
              >
                <div className="relative overflow-hidden aspect-square bg-sumi/50">
                  {person.image ? (
                    <img
                      src={person.image}
                      alt={person.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-shiro/5 flex items-center justify-center">
                        <Camera size={22} className="text-shiro/15" />
                      </div>
                      <p className="text-[10px] text-shiro/20 uppercase tracking-wider">Foto em breve</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-kuro/60 via-transparent to-transparent" />
                </div>

                <div className="p-4 text-center">
                  {person.role === 'Amigo da Marca' && (
                    <span className="inline-block text-[10px] font-semibold text-kin uppercase tracking-wider mb-1">Amigo da Marca</span>
                  )}
                  <h3 className="text-sm font-bold text-shiro leading-tight">{person.name}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PATROCINADOS */}
      <section className="py-16 sm:py-20 bg-shiro">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-aka text-xs tracking-[0.3em] uppercase font-medium">
              Atletas
            </span>
            <h2 className="font-jp text-3xl sm:text-4xl font-bold text-kuro mt-3 tracking-wide">
              Nossos Patrocinados
            </h2>
            <div className="w-12 h-0.5 bg-aka mx-auto mt-4" />
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {sponsored.map((person, i) => (
              <PersonCard key={person.name} person={person} index={i} />
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
