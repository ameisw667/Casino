import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Eye,
  EyeOff,
  Gamepad2,
  History,
  LayoutDashboard,
  Menu,
  Radio,
  ShieldCheck,
  Sparkles,
  Trophy,
  Vault,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import styles from './NeonArcadeDashboard.module.css';
import {
  filterDashboardGames,
  formatDashboardMoney,
  resolveDashboardGame,
  type DashboardCategory,
  type DashboardGame,
  type DashboardMetrics,
  type DashboardVisual,
} from './neon-arcade-dashboard-model';

interface NeonArcadeDashboardViewProps {
  games: readonly DashboardGame[];
  activeCategory: DashboardCategory;
  onCategoryChange: (category: DashboardCategory) => void;
  activeGameId: DashboardGame['id'];
  onGameSelect: (id: DashboardGame['id']) => void;
  menuOpen: boolean;
  onMenuToggle: () => void;
  onMenuClose: () => void;
  hideBalance: boolean;
  onToggleBalance: () => void;
  balance: number;
  rank: string;
  level: number;
  xpProgress: number;
  displayName: string;
  metrics: DashboardMetrics;
  communityProgress: number;
  communityWagered: number;
  communityGoal: number;
  isSignedIn?: boolean;
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/testing/neon-arcade-dashboard', icon: LayoutDashboard },
  { label: 'Games', href: '/games', icon: Gamepad2 },
  { label: 'My bets', href: '/history', icon: History },
  { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { label: 'Vault', href: '/vault', icon: Vault },
  { label: 'Stats', href: '/stats', icon: BarChart3 },
] as const;

const FILTERS: ReadonlyArray<{ id: DashboardCategory; label: string }> = [
  { id: 'featured', label: 'Featured' },
  { id: 'fast', label: 'Fast rounds' },
  { id: 'table', label: 'Table' },
  { id: 'all', label: 'All games' },
];

function BrandMark() {
  return (
    <span className={styles.brandMark} aria-hidden="true">
      <span className={styles.brandMarkInner}>AR</span>
    </span>
  );
}

function GameVisual({ visual }: { visual: DashboardVisual }) {
  if (visual === 'crash-curve') {
    return (
      <div className={`${styles.gameVisual} ${styles.crashVisual}`} aria-hidden="true">
        <svg viewBox="0 0 360 190" role="presentation">
          <defs>
            <linearGradient id="crashFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity="0.32" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            className={styles.chartGrid}
            d="M22 42H338M22 88H338M22 134H338M78 20V164M142 20V164M206 20V164M270 20V164"
          />
          <path
            className={styles.chartArea}
            d="M22 153C72 150 98 142 128 129C165 113 172 92 203 82C235 72 250 56 274 39C294 25 315 22 338 20V164H22Z"
          />
          <path
            className={styles.chartLine}
            d="M22 153C72 150 98 142 128 129C165 113 172 92 203 82C235 72 250 56 274 39C294 25 315 22 338 20"
          />
          <circle className={styles.chartPoint} cx="338" cy="20" r="6" />
        </svg>
        <div className={styles.visualReadout}>
          <span>Live trajectory</span>
          <strong>3.84x</strong>
        </div>
      </div>
    );
  }

  if (visual === 'roulette-wheel') {
    return (
      <div
        className={`${styles.gameVisual} ${styles.rouletteVisual}`}
        data-game-visual="roulette-table-v2"
        role="img"
        aria-label="European roulette table with a single zero wheel and inside betting layout"
      >
        <div className={styles.rouletteTableFelt}>
          <div className={styles.rouletteWheelV2}>
            <div className={styles.rouletteTrackV2} />
            <div className={styles.rouletteHubV2}>
              <span>17</span>
            </div>
            <div className={styles.rouletteBallV2} />
            <div className={styles.rouletteZero}>0</div>
          </div>
          <div className={styles.bettingBoard}>
            <div className={styles.bettingBoardTitle}>Inside bets</div>
            <div className={styles.numberGrid}>
              {[3, 6, 9, 12, 2, 5, 8, 11, 1, 4, 7, 10].map((number) => (
                <span key={number} className={number % 2 === 0 ? styles.numberRed : ''}>
                  {number}
                </span>
              ))}
            </div>
            <div className={styles.outsideBets}>
              <span>1–18</span>
              <span>Even</span>
              <span>Red</span>
            </div>
          </div>
        </div>
        <div className={styles.wheelLegend}>
          <span>Table standard</span>
          <strong>European single zero</strong>
        </div>
      </div>
    );
  }

  if (visual === 'card-fan') {
    return (
      <div
        className={`${styles.gameVisual} ${styles.cardsVisual}`}
        data-game-visual="blackjack-table-v2"
        role="img"
        aria-label="Private blackjack table showing dealer seventeen and player twenty-one"
      >
        <div className={styles.blackjackFelt}>
          <div className={styles.tableArc} />
          <div className={styles.dealerZone}>
            <span>Dealer</span>
            <div className={styles.dealerHand}>
              <i className={styles.cardBack} />
              <i className={styles.miniCard}>
                <b>7</b>
                <small>◆</small>
              </i>
            </div>
            <strong>17</strong>
          </div>
          <div className={styles.tableMessage}>Blackjack pays 3 to 2</div>
          <div className={styles.playerZone}>
            <span>Player</span>
            <div className={styles.playerHand}>
              <i className={styles.miniCard}>
                <b>A</b>
                <small>♠</small>
              </i>
              <i className={`${styles.miniCard} ${styles.redCard}`}>
                <b>K</b>
                <small>♥</small>
              </i>
            </div>
            <strong>21</strong>
          </div>
          <div className={styles.chipStack} aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className={styles.cardScore}>
          <span>Private rule</span>
          <strong>Dealer stands on 17</strong>
        </div>
      </div>
    );
  }

  if (visual === 'dice-distribution') {
    return (
      <div className={`${styles.gameVisual} ${styles.diceVisual}`} aria-hidden="true">
        <div className={styles.distributionBars}>
          {[28, 46, 67, 92, 72, 51, 32].map((height, index) => (
            <span key={height} style={{ height: `${height}%` }} data-index={index} />
          ))}
        </div>
        <div className={styles.dicePair}>
          <span className={styles.die}>
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className={`${styles.die} ${styles.dieAlt}`}>
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className={styles.probabilityLabel}>
          <span>Win chance</span>
          <strong>49.5%</strong>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.gameVisual} ${styles.slotsVisual}`} aria-hidden="true">
      <div className={styles.reelWindow}>
        {['7', 'BAR', '7'].map((symbol, index) => (
          <span className={styles.reel} key={`${symbol}-${index}`}>
            <small>{index === 1 ? '◆' : '●'}</small>
            <strong>{symbol}</strong>
            <small>{index === 1 ? '●' : '◆'}</small>
          </span>
        ))}
        <i className={styles.payline} />
      </div>
      <div className={styles.reelMeta}>
        <span>Progressive pool</span>
        <strong>$84,120</strong>
      </div>
    </div>
  );
}

function Sidebar({ menuOpen, onClose }: { menuOpen: boolean; onClose: () => void }) {
  return (
    <>
      <button
        className={`${styles.drawerBackdrop} ${menuOpen ? styles.drawerBackdropOpen : ''}`}
        aria-label="Close navigation"
        tabIndex={menuOpen ? 0 : -1}
        onClick={onClose}
      />
      <aside
        className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}
        data-menu-open={String(menuOpen)}
      >
        <div className={styles.brandRow}>
          <Link href="/testing/neon-arcade-dashboard" className={styles.brand} onClick={onClose}>
            <BrandMark />
            <span>
              <strong>ARCADE</strong>
              <small>ROYALE</small>
            </span>
          </Link>
          <button className={styles.closeMenu} onClick={onClose} aria-label="Close navigation menu">
            <X size={20} />
          </button>
        </div>

        <div className={styles.navLabel}>Private floor</div>
        <nav className={styles.primaryNav} aria-label="Primary navigation">
          {NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                href={item.href}
                key={item.href}
                className={`${styles.navItem} ${index === 0 ? styles.navItemActive : ''}`}
                aria-current={index === 0 ? 'page' : undefined}
                onClick={onClose}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
                {index === 0 && <i />}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarSpacer} />

        <div className={styles.rankCard}>
          <div className={styles.rankCardTop}>
            <span>Next room</span>
            <strong>74%</strong>
          </div>
          <div className={styles.rankTrack}>
            <i style={{ width: '74%' }} />
          </div>
          <p>Keep the pace measured. Your next private room is getting closer.</p>
        </div>

        <div className={styles.trustNote}>
          <ShieldCheck size={18} />
          <span>
            <strong>Provably fair</strong>
            <small>Every result is verifiable</small>
          </span>
        </div>
      </aside>
    </>
  );
}

export function NeonArcadeDashboardView({
  games,
  activeCategory,
  onCategoryChange,
  activeGameId,
  onGameSelect,
  menuOpen,
  onMenuToggle,
  onMenuClose,
  hideBalance,
  onToggleBalance,
  balance,
  rank,
  level,
  xpProgress,
  displayName,
  metrics,
  communityProgress,
  communityWagered,
  communityGoal,
  isSignedIn = false,
}: NeonArcadeDashboardViewProps) {
  const visibleGames = filterDashboardGames(games, activeCategory);
  const activeGame = resolveDashboardGame(visibleGames, activeGameId);
  const safeXpProgress = Math.min(100, Math.max(0, xpProgress));
  const safeCommunityProgress = Math.min(100, Math.max(0, communityProgress));

  return (
    <div className={styles.dashboard} data-dashboard="neon-arcade">
      <Sidebar menuOpen={menuOpen} onClose={onMenuClose} />

      <div className={styles.contentShell}>
        <header className={styles.topbar}>
          <div className={styles.mobileBrandCluster}>
            <button
              className={styles.menuButton}
              onClick={onMenuToggle}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
            >
              <Menu size={20} />
            </button>
            <Link href="/testing/neon-arcade-dashboard" className={styles.mobileBrand}>
              <BrandMark />
              <strong>ARCADE ROYALE</strong>
            </Link>
          </div>

          <div className={styles.liveStatus}>
            <span className={styles.liveDot} />
            <span>
              <strong>Floor live</strong>
              <small>42 tables open</small>
            </span>
          </div>

          <div className={styles.accountBar}>
            <div className={styles.balanceCard}>
              <Wallet size={16} aria-hidden="true" />
              <span>
                <small>Balance</small>
                <strong>{hideBalance ? '••••••' : formatDashboardMoney(balance)}</strong>
              </span>
              <button
                onClick={onToggleBalance}
                aria-label={hideBalance ? 'Show balance' : 'Hide balance'}
              >
                {hideBalance ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
            <Link className={styles.accountAction} href={isSignedIn ? '/vault' : '/sign-in'}>
              {isSignedIn ? 'Deposit' : 'Sign in'}
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </header>

        <main className={styles.main}>
          <section className={styles.hero} aria-labelledby="dashboard-title">
            <div className={styles.heroCopy}>
              <div className={styles.eyebrow}>
                <Sparkles size={14} /> Curated play, no noise
              </div>
              <h1 id="dashboard-title">
                Pick your pace.
                <br />
                <span>Own the run.</span>
              </h1>
              <p>
                Five distinct games. One composed floor. Move fast, stay tactical, or settle into
                the table — every route keeps the choice in your hands.
              </p>
              <div className={styles.heroActions}>
                <Link href="/games/crash" className={styles.primaryAction}>
                  Play the live curve <ArrowUpRight size={17} />
                </Link>
                <Link href="/games" className={styles.secondaryAction}>
                  Browse all games
                </Link>
              </div>
              <div className={styles.heroTrust}>
                <span>
                  <ShieldCheck size={16} /> Provably fair
                </span>
                <span>
                  <Zap size={16} /> Instant rounds
                </span>
              </div>
            </div>

            <div
              className={styles.floorPulse}
              aria-label="Live floor volatility mix: 38 percent calm, 42 percent balanced, 20 percent high energy"
            >
              <div className={styles.pulseHeader}>
                <span>
                  <Radio size={15} /> Live floor pulse
                </span>
                <small>Updated now</small>
              </div>
              <div className={styles.pulseStage} aria-hidden="true">
                <div className={styles.pulseOrbit}>
                  <i />
                  <i />
                  <i />
                </div>
                <div className={styles.pulseCenter}>
                  <span>42</span>
                  <small>
                    open
                    <br />
                    tables
                  </small>
                </div>
                <span className={`${styles.pulseNode} ${styles.pulseNodeOne}`}>
                  <i /> Calm
                </span>
                <span className={`${styles.pulseNode} ${styles.pulseNodeTwo}`}>
                  <i /> Balanced
                </span>
                <span className={`${styles.pulseNode} ${styles.pulseNodeThree}`}>
                  <i /> High
                </span>
              </div>
              <div className={styles.volatilityMix}>
                <div>
                  <span>Calm</span>
                  <strong>38%</strong>
                  <i>
                    <b style={{ width: '38%' }} />
                  </i>
                </div>
                <div>
                  <span>Balanced</span>
                  <strong>42%</strong>
                  <i>
                    <b style={{ width: '42%' }} />
                  </i>
                </div>
                <div>
                  <span>High energy</span>
                  <strong>20%</strong>
                  <i>
                    <b style={{ width: '20%' }} />
                  </i>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.gameFloor} aria-labelledby="game-floor-title">
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.sectionIndex}>01</span>
                <div>
                  <h2 id="game-floor-title">Choose your room</h2>
                  <p>Different mechanics, one clear route into play.</p>
                </div>
              </div>
              <div className={styles.filters} aria-label="Filter games">
                {FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    className={activeCategory === filter.id ? styles.filterActive : ''}
                    aria-pressed={activeCategory === filter.id}
                    onClick={() => onCategoryChange(filter.id)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.gameRunway} data-layout="game-runway">
              {activeGame ? (
                <>
                  <article
                    key={activeGame.id}
                    className={`${styles.gameSpotlight} ${styles[activeGame.tone]}`}
                    data-active-game={activeGame.id}
                  >
                    <div className={styles.spotlightHeader}>
                      <span>{activeGame.eyebrow}</span>
                      <i>{activeGame.volatility} volatility</i>
                    </div>
                    <GameVisual visual={activeGame.visual} />
                    <div className={styles.spotlightFooter}>
                      <div className={styles.spotlightCopy}>
                        <span className={styles.spotlightNumber}>
                          {String(
                            visibleGames.findIndex((game) => game.id === activeGame.id) + 1,
                          ).padStart(2, '0')}
                        </span>
                        <div>
                          <h3>{activeGame.name}</h3>
                          <p>{activeGame.description}</p>
                        </div>
                      </div>
                      <div className={styles.spotlightMeta}>
                        <span>
                          Max payout<strong>{activeGame.maxPayout}</strong>
                        </span>
                        <Link
                          href={activeGame.path}
                          className={styles.gameLink}
                          aria-label={`Play ${activeGame.name}`}
                        >
                          Enter room <ArrowUpRight size={17} />
                        </Link>
                      </div>
                    </div>
                  </article>

                  <div className={styles.roomIndex} role="group" aria-label="Choose a game room">
                    <div className={styles.roomIndexHeader}>
                      <span>Room index</span>
                      <strong>{String(visibleGames.length).padStart(2, '0')} open</strong>
                    </div>
                    <div className={styles.roomList}>
                      {visibleGames.map((game, index) => {
                        const isActive = activeGame.id === game.id;
                        return (
                          <div
                            className={`${styles.roomItem} ${isActive ? styles.roomItemActive : ''}`}
                            key={game.id}
                          >
                            <button
                              type="button"
                              aria-label={`Select ${game.name}`}
                              aria-pressed={isActive}
                              onClick={() => onGameSelect(game.id)}
                            >
                              <span className={styles.roomNumber}>
                                {String(index + 1).padStart(2, '0')}
                              </span>
                              <span className={styles.roomIdentity}>
                                <strong>{game.name}</strong>
                                <small>
                                  {game.eyebrow} · {game.volatility}
                                </small>
                              </span>
                              <i className={`${styles.roomTone} ${styles[game.tone]}`} />
                            </button>
                            <Link href={game.path} aria-label={`Open ${game.name}`}>
                              <ArrowUpRight size={16} />
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                    <div className={styles.roomIndexFooter}>
                      <span>Selection changes the stage</span>
                      <i />
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles.emptyRunway}>
                  <strong>No rooms match this filter.</strong>
                  <p>Choose another category to reopen the floor.</p>
                </div>
              )}
            </div>
          </section>

          <section className={styles.insights} aria-labelledby="insights-title">
            <div className={styles.sectionHeading}>
              <div>
                <span className={styles.sectionIndex}>02</span>
                <div>
                  <h2 id="insights-title">Your session, in focus</h2>
                  <p>Useful signals without turning play into a trading terminal.</p>
                </div>
              </div>
            </div>

            <div className={styles.insightGrid}>
              <article className={styles.sessionCard}>
                <div className={styles.cardTitle}>
                  <span>
                    <Activity size={17} /> Your pulse
                  </span>
                  <small>Current session</small>
                </div>
                <div className={styles.metricGrid}>
                  <div>
                    <span>Wagered</span>
                    <strong>{formatDashboardMoney(metrics.totalWagered)}</strong>
                  </div>
                  <div>
                    <span>Win rate</span>
                    <strong>{metrics.winRate}%</strong>
                  </div>
                  <div>
                    <span>Best run</span>
                    <strong>{metrics.bestMultiplier.toFixed(2)}x</strong>
                  </div>
                </div>
                <div
                  className={styles.activityChart}
                  aria-label={`Seven-round activity; highest relative activity ${Math.max(...metrics.activityBars)} percent`}
                >
                  {metrics.activityBars.map((value, index) => (
                    <i key={`${value}-${index}`} style={{ height: `${Math.max(5, value)}%` }} />
                  ))}
                </div>
                <div className={styles.rankProgress}>
                  <div>
                    <span>
                      {rank.toUpperCase()} · LEVEL {level}
                    </span>
                    <strong>{Math.round(safeXpProgress)}%</strong>
                  </div>
                  <i>
                    <b style={{ width: `${safeXpProgress}%` }} />
                  </i>
                </div>
              </article>

              <article className={styles.liveFloorCard}>
                <div className={styles.cardTitle}>
                  <span>
                    <Radio size={17} /> Live floor
                  </span>
                  <Link href="/history">
                    My bets <ArrowUpRight size={14} />
                  </Link>
                </div>
                <div className={styles.liveTable}>
                  <div className={styles.liveTableHead}>
                    <span>Player / game</span>
                    <span>Multiplier</span>
                    <span>Payout</span>
                  </div>
                  {metrics.recentWins.length > 0 ? (
                    metrics.recentWins.map((bet) => (
                      <div className={styles.liveRow} key={bet.id}>
                        <span>
                          <i>{bet.user.slice(0, 1).toUpperCase()}</i>
                          <b>
                            {bet.user}
                            <small>
                              {bet.game} · {bet.time}
                            </small>
                          </b>
                        </span>
                        <strong>{bet.multiplier.toFixed(2)}x</strong>
                        <em>+{formatDashboardMoney(bet.payout)}</em>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyFloor}>
                      <span className={styles.emptySignal}>
                        <i />
                        <i />
                        <i />
                      </span>
                      <strong>The floor is quiet.</strong>
                      <p>Your latest wins will appear here after a round.</p>
                    </div>
                  )}
                </div>
              </article>

              <article className={styles.communityCard}>
                <div className={styles.cardTitle}>
                  <span>
                    <Trophy size={17} /> Community run
                  </span>
                  <small>Weekly target</small>
                </div>
                <div
                  className={styles.communityGauge}
                  style={
                    { '--progress': `${safeCommunityProgress * 3.6}deg` } as React.CSSProperties
                  }
                >
                  <div>
                    <strong>{Math.round(safeCommunityProgress)}%</strong>
                    <span>complete</span>
                  </div>
                </div>
                <div className={styles.communityNumbers}>
                  <span>{formatDashboardMoney(communityWagered)} pooled</span>
                  <strong>{formatDashboardMoney(communityGoal)} goal</strong>
                </div>
                <p>Every verified wager moves the shared floor toward this week’s reward room.</p>
                <Link href="/leaderboard">
                  View the run <ArrowUpRight size={15} />
                </Link>
              </article>
            </div>
          </section>

          <footer className={styles.footer}>
            <span>Arcade Royale · Design test surface</span>
            <span>Welcome back, {displayName}</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
