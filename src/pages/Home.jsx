import { Link } from 'react-router-dom'
import assIndexLogo from '../assets/placeholders/Ass-Index-Logo.svg'
import heroBackground from '../assets/placeholders/background-hero.svg'
import betterOrWorseLogo from '../assets/placeholders/Better-Or-Worse-Logo.svg'
import howToPlayImage from '../assets/placeholders/How-To-Play.svg'
import playButtonImage from '../assets/placeholders/Play.svg'
import liveTableImage from '../assets/placeholders/Live-Table.svg'

function Home() {
  return (
    <section className="fade-in-up relative overflow-hidden rounded-[26px] border border-white/10 bg-black/50 shadow-[0_40px_120px_rgba(0,0,0,0.7)]">
      <div className="absolute inset-0">
        <img
          src={heroBackground}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/80" />
      </div>
      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 pb-10 pt-6 text-center">
        <img
          src={assIndexLogo}
          alt="The Ass Index logo"
          className="floating-badge h-[120px] w-auto drop-shadow-[0_0_35px_rgba(157,255,57,0.7)] sm:h-40"
        />
        <h1 className="sr-only">Better or worse than Billy Gunn?</h1>
        <img
          src={betterOrWorseLogo}
          alt=""
          aria-hidden="true"
          className="mt-[2px] w-full max-w-2xl opacity-95 drop-shadow-[0_0_25px_rgba(120,255,40,0.6)] sm:mt-[-6px]"
        />
        <p className="mt-[2px] max-w-[900px] whitespace-normal text-base font-semibold text-white/80 sm:mt-[-18px] sm:whitespace-nowrap sm:text-[27px]">
          Rate <span className="font-semibold text-white">500 Wrestlers</span>{' '}
          with a knee-jerk reaction. No stats. No debate.{' '}
          <span className="border-b border-lime-300/70 text-lime-200">
            Just Instinct.
          </span>
        </p>
        <div className="mt-2 flex w-full flex-col items-center gap-[2px] sm:mt-[-6px] sm:gap-3">
          <Link
            to="/play"
            className="group card-lift glow-outline flex min-h-[48px] w-full max-w-sm items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200 sm:mt-[-10px] sm:w-auto"
          >
            <span className="sr-only">Play Now</span>
            <img
              src={playButtonImage}
              alt="Play now"
              className="h-24 w-full scale-[1.2] object-contain drop-shadow-[0_0_18px_rgba(157,255,57,0.6)] transition group-hover:brightness-110 sm:h-40 sm:w-auto"
            />
          </Link>
          <Link
            to="/official"
            className="group card-lift glow-outline flex min-h-[48px] w-full max-w-sm items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200 sm:-mt-[45px] sm:w-auto"
          >
            <span className="sr-only">View Official WrestleTalk Table</span>
            <img
              src={liveTableImage}
              alt="View Official WrestleTalk Table"
              className="h-10 w-full object-contain transition group-hover:brightness-110 sm:h-[72px] sm:w-auto"
            />
          </Link>
        </div>
      </div>
      <div className="relative mx-auto mt-px flex w-full max-w-5xl items-center justify-center px-6 pb-4 sm:-mt-[70px] sm:pb-8">
        <img
          src={howToPlayImage}
          alt="How to play"
          className="w-full max-w-[1152px] opacity-95"
        />
      </div>
    </section>
  )
}

export default Home
