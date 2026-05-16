type Suit = 'spades' | 'clubs' | 'hearts' | 'diamonds'
type CardValue = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

export interface Card {
  suit: Suit
  value: CardValue
  numericValue: number
  faceDown: boolean
}

export interface BlackjackHand {
  cards: Card[]
  score: number
  isBust: boolean
  isBlackjack: boolean
  isSoft: boolean
}

export type GamePhase = 'IDLE' | 'DEALING' | 'PLAYER_TURN' | 'PLAYER_TURN_HAND2' | 'DEALER_TURN' | 'SETTLEMENT'

export type GameResult = 'WIN' | 'LOSS' | 'PUSH' | 'BLACKJACK' | 'BUST'

export interface BlackjackGameState {
  phase: GamePhase
  deck: Card[]
  playerHand: BlackjackHand
  playerHand2?: BlackjackHand
  dealerHand: BlackjackHand
  activeHandIndex: 0 | 1
  canDouble: boolean
  canSplit: boolean
  result?: GameResult
  result2?: Exclude<GameResult, 'BLACKJACK'>
  payout: number
  payoutMultiplier: number
}

export class BlackjackEngine {
  static createDeck(numberOfDecks: number = 6): Card[] {
    const deck: Card[] = []
    const suits: Suit[] = ['spades', 'clubs', 'hearts', 'diamonds']
    const values: CardValue[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

    for (let d = 0; d < numberOfDecks; d++) {
      for (const suit of suits) {
        for (const value of values) {
          const numericValue = this.getNumericValue(value)
          deck.push({
            suit,
            value,
            numericValue,
            faceDown: false
          })
        }
      }
    }

    return deck
  }

  private static getNumericValue(value: CardValue): number {
    if (value === 'A') return 11
    if (value === 'J' || value === 'Q' || value === 'K') return 10
    return parseInt(value, 10)
  }

  static shuffleDeck(deck: Card[], seedIndices: number[]): Card[] {
    const shuffled = [...deck]
    let seedIndex = 0

    for (let i = shuffled.length - 1; i > 0; i--) {
      if (seedIndex >= seedIndices.length) {
        seedIndex = 0
      }

      const j = seedIndices[seedIndex] % (i + 1)
      seedIndex++

      const temp = shuffled[i]
      shuffled[i] = shuffled[j]
      shuffled[j] = temp
    }

    return shuffled
  }

  static calculateScore(cards: Card[]): { score: number; isSoft: boolean } {
    let hardScore = 0
    let aces = 0

    for (const card of cards) {
      if (card.value === 'A') {
        aces++
        hardScore += 11
      } else {
        hardScore += card.numericValue
      }
    }

    let score = hardScore
    let isSoft = false

    while (score > 21 && aces > 0) {
      score -= 10
      aces--
    }

    if (aces > 0 && score <= 21) {
      isSoft = true
    }

    return { score, isSoft }
  }

  private static createHand(cards: Card[]): BlackjackHand {
    const { score, isSoft } = this.calculateScore(cards)
    const isBust = score > 21
    const isBlackjack = cards.length === 2 && score === 21 && isSoft

    return {
      cards,
      score,
      isBust,
      isBlackjack,
      isSoft
    }
  }

  static deal(deck: Card[]): BlackjackGameState {
    if (deck.length < 4) {
      throw new Error('Deck has fewer than 4 cards remaining')
    }

    const deckCopy = [...deck]
    const playerCards = [deckCopy.shift()!, deckCopy.shift()!]
    const dealerCards = [deckCopy.shift()!, { ...deckCopy.shift()!, faceDown: true }]

    const playerHand = this.createHand(playerCards)
    const dealerHand = this.createHand(dealerCards)

    const canDouble = playerCards.length === 2
    const canSplit = this.canSplit(playerHand)

    return {
      phase: 'DEALING',
      deck: deckCopy,
      playerHand,
      dealerHand,
      activeHandIndex: 0,
      canDouble,
      canSplit,
      payout: 0,
      payoutMultiplier: 1
    }
  }

  static hit(state: BlackjackGameState): BlackjackGameState {
    if (state.phase !== 'PLAYER_TURN' && state.phase !== 'PLAYER_TURN_HAND2') {
      return state
    }

    const deckCopy = [...state.deck]
    if (deckCopy.length === 0) {
      throw new Error('Deck is empty')
    }

    const newCard = deckCopy.shift()!
    const activeHand = state.activeHandIndex === 0 ? state.playerHand : state.playerHand2

    if (!activeHand) {
      return state
    }

    const updatedCards = [...activeHand.cards, newCard]
    const updatedHand = this.createHand(updatedCards)

    const newState = { ...state, deck: deckCopy, canDouble: false }

    if (state.activeHandIndex === 0) {
      newState.playerHand = updatedHand
    } else {
      newState.playerHand2 = updatedHand
    }

    if (updatedHand.isBust) {
      if (state.phase === 'PLAYER_TURN' && state.playerHand2) {
        newState.phase = 'PLAYER_TURN_HAND2'
        newState.activeHandIndex = 1
      } else {
        // Single-hand bust OR bust on hand 2 → dealer plays
        newState.phase = 'DEALER_TURN'
      }
    }

    return newState
  }

  static stand(state: BlackjackGameState): BlackjackGameState {
    if (state.phase === 'PLAYER_TURN' && state.playerHand2) {
      return { ...state, phase: 'PLAYER_TURN_HAND2', activeHandIndex: 1 }
    }

    if (state.phase === 'PLAYER_TURN_HAND2') {
      return { ...state, phase: 'DEALER_TURN' }
    }

    return { ...state, phase: 'DEALER_TURN' }
  }

  static double(state: BlackjackGameState): BlackjackGameState {
    if (state.phase !== 'PLAYER_TURN' && state.phase !== 'PLAYER_TURN_HAND2') {
      return state
    }

    const activeHand = state.activeHandIndex === 0 ? state.playerHand : state.playerHand2

    if (!activeHand || activeHand.cards.length !== 2) {
      return state
    }

    const deckCopy = [...state.deck]
    if (deckCopy.length === 0) {
      throw new Error('Deck is empty')
    }

    const newCard = deckCopy.shift()!
    const updatedCards = [...activeHand.cards, newCard]
    const updatedHand = this.createHand(updatedCards)

    const newState = { ...state, deck: deckCopy, canDouble: false }

    if (state.activeHandIndex === 0) {
      newState.playerHand = updatedHand
      if (state.playerHand2) {
        newState.phase = 'PLAYER_TURN_HAND2'
        newState.activeHandIndex = 1
      } else {
        newState.phase = 'DEALER_TURN'
      }
    } else {
      newState.playerHand2 = updatedHand
      newState.phase = 'DEALER_TURN'
    }

    return newState
  }

  static canSplit(hand: BlackjackHand): boolean {
    if (hand.cards.length !== 2) {
      return false
    }

    const card1 = hand.cards[0]
    const card2 = hand.cards[1]

    return card1.value === card2.value
  }

  static split(state: BlackjackGameState): BlackjackGameState {
    if (state.phase !== 'PLAYER_TURN' || !this.canSplit(state.playerHand)) {
      return state
    }

    const deckCopy = [...state.deck]

    if (deckCopy.length < 2) {
      throw new Error('Deck has fewer than 2 cards for split')
    }

    const card1 = state.playerHand.cards[0]
    const card2 = deckCopy.shift()!
    const card3 = deckCopy.shift()!

    const hand1 = this.createHand([card1, card2])
    const hand2 = this.createHand([state.playerHand.cards[1], card3])

    return {
      ...state,
      deck: deckCopy,
      playerHand: hand1,
      playerHand2: hand2,
      activeHandIndex: 0,
      phase: 'PLAYER_TURN',
      canSplit: false,
      canDouble: true
    }
  }

  static playDealerHand(state: BlackjackGameState): BlackjackGameState {
    if (state.phase !== 'DEALER_TURN') {
      return state
    }

    const deckCopy = [...state.deck]
    const revealedCard = { ...state.dealerHand.cards[1], faceDown: false }
    let dealerHand = this.createHand([state.dealerHand.cards[0], revealedCard])

    if (state.playerHand.isBust && (!state.playerHand2 || state.playerHand2.isBust)) {
      return { ...state, deck: deckCopy, dealerHand, phase: 'SETTLEMENT' }
    }

    while (dealerHand.score < 17 || (dealerHand.score === 17 && dealerHand.isSoft)) {
      if (deckCopy.length === 0) {
        break
      }

      const newCard = deckCopy.shift()!
      dealerHand = this.createHand([...dealerHand.cards, newCard])
    }

    return { ...state, deck: deckCopy, dealerHand, phase: 'SETTLEMENT' }
  }

  static settleGame(state: BlackjackGameState): BlackjackGameState {
    let totalPayout = 0
    let result: GameResult = 'LOSS'
    let result2: Exclude<GameResult, 'BLACKJACK'> | undefined

    const dealerScore = state.dealerHand.score
    const dealerBust = state.dealerHand.isBust

    const playerScore = state.playerHand.score
    const playerBust = state.playerHand.isBust

    if (state.playerHand.isBlackjack && state.dealerHand.cards.length === 2) {
      const dealerHasBlackjack = state.dealerHand.score === 21 && state.dealerHand.cards.length === 2

      if (!dealerHasBlackjack) {
        result = 'BLACKJACK'
        totalPayout = 2.5
      } else {
        result = 'PUSH'
        totalPayout = 1.0
      }
    } else if (playerBust) {
      result = 'BUST'
      totalPayout = 0
    } else if (dealerBust) {
      result = 'WIN'
      totalPayout = 2.0
    } else if (playerScore > dealerScore) {
      result = 'WIN'
      totalPayout = 2.0
    } else if (playerScore === dealerScore) {
      result = 'PUSH'
      totalPayout = 1.0
    } else {
      result = 'LOSS'
      totalPayout = 0
    }

    let payout2 = 0

    if (state.playerHand2) {
      const player2Score = state.playerHand2.score
      const player2Bust = state.playerHand2.isBust

      if (player2Bust) {
        result2 = 'BUST'
        payout2 = 0
      } else if (dealerBust) {
        result2 = 'WIN'
        payout2 = 2.0
      } else if (player2Score > dealerScore) {
        result2 = 'WIN'
        payout2 = 2.0
      } else if (player2Score === dealerScore) {
        result2 = 'PUSH'
        payout2 = 1.0
      } else {
        result2 = 'LOSS'
        payout2 = 0
      }
    }

    let payoutMultiplier = totalPayout

    if (state.playerHand2) {
      payoutMultiplier = (totalPayout + (payout2 || 0)) / 2
    }

    return {
      ...state,
      phase: 'SETTLEMENT',
      result,
      result2,
      payout: payoutMultiplier,
      payoutMultiplier
    }
  }
}
