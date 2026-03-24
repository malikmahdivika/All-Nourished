import { useEffect, useMemo, useRef, useState } from 'react'
import { FOOD_FACTS, INGREDIENTS, MEALS, randomMeal } from '../gameData'

const START_STOCK = 5
const MAX_STOCK = 6
const MAX_QUEUE = 5

const CUSTOMER_VARIANTS = [
  { head: '#f1c27d', body: '#6f8fb8', hair: '#3a2a22', emoji: '🙂' },
  { head: '#e0ac69', body: '#8b6b61', hair: '#2b1d17', emoji: '🙂' },
  { head: '#c68642', body: '#5b8a72', hair: '#3b2b22', emoji: '🙂' },
  { head: '#8d5524', body: '#8d6aa8', hair: '#1c140f', emoji: '🙂' },
  { head: '#f1c27d', body: '#a87450', hair: '#d2b48c', emoji: '🙂' },
]

function createCustomer(id, difficulty) {
  const meal = randomMeal()
  const patience = Math.max(4, 15 - difficulty * 1.2)
  const look = CUSTOMER_VARIANTS[id % CUSTOMER_VARIANTS.length]

  return {
    id,
    name: `guest ${id}`,
    requestedMealId: meal.id,
    requestedMealName: meal.name,
    patience,
    maxPatience: patience,
    look,
  }
}

function canServeMeal(meal, stock) {
  return Object.entries(meal.ingredients).every(([ingredient, amount]) => stock[ingredient] >= amount)
}

function getPatiencePercent(customer) {
  return Math.max(0, Math.round((customer.patience / customer.maxPatience) * 100))
}

export default function GameScreen({ username, onGameOver }) {
  const customerIdRef = useRef(1)

  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [elapsed, setElapsed] = useState(0)
  const [selectedMealId, setSelectedMealId] = useState(null)
  const [factIndex, setFactIndex] = useState(0)
  const [stock, setStock] = useState(() =>
    Object.fromEntries(INGREDIENTS.map((name) => [name, START_STOCK]))
  )
  const [queue, setQueue] = useState(() => [createCustomer(customerIdRef.current++, 0)])
  const [toast, setToast] = useState('serve the right meal and keep ingredients stocked.')

  const difficulty = Math.floor(elapsed / 10)

  useEffect(() => {
    const clock = window.setInterval(() => {
      setElapsed((current) => current + 1)
    }, 1000)

    return () => window.clearInterval(clock)
  }, [])

  useEffect(() => {
    const factTimer = window.setInterval(() => {
      setFactIndex((current) => (current + 1) % FOOD_FACTS.length)
    }, 10000)

    return () => window.clearInterval(factTimer)
  }, [])

  useEffect(() => {
    const spawnRate = Math.max(1500, 5000 - difficulty * 350)

    const spawner = window.setInterval(() => {
      setQueue((current) => {
        if (current.length >= MAX_QUEUE) return current
        return [...current, createCustomer(customerIdRef.current++, difficulty)]
      })
    }, spawnRate)

    return () => window.clearInterval(spawner)
  }, [difficulty])

  useEffect(() => {
    const patienceTimer = window.setInterval(() => {
      let misses = 0
      const decrement = 0.5 * (1 + difficulty * 0.1)

      setQueue((current) => {
        const next = current
          .map((customer) => ({
            ...customer,
            patience: Number((customer.patience - decrement).toFixed(1)),
          }))
          .filter((customer) => {
            if (customer.patience <= 0) {
              misses += 1
              return false
            }
            return true
          })

        if (misses > 0) {
          setLives((currentLives) => Math.max(0, currentLives - misses))
          setToast(
            misses === 1
              ? 'a meal was missed. you lost a life.'
              : `${misses} meals were missed. you lost ${misses} lives.`
          )
        }

        return next.length > 0 ? next : [createCustomer(customerIdRef.current++, difficulty)]
      })
    }, 500)

    return () => window.clearInterval(patienceTimer)
  }, [difficulty]) 

  useEffect(() => {
    if (lives <= 0) {
      onGameOver({ score, timeSurvived: elapsed })
    }
  }, [elapsed, lives, onGameOver, score])

  function handleMealClick(meal) {
    if (!canServeMeal(meal, stock)) {
      setToast(`${meal.name} is unavailable. restock ingredients first.`)
      return
    }

    setSelectedMealId(meal.id)
    setToast(`${meal.name} selected. now click the matching customer.`)
  }

  function handleCustomerClick(customer) {
    const selectedMeal = MEALS.find((meal) => meal.id === selectedMealId)

    if (!selectedMeal) {
      setToast('pick a meal first.')
      return
    }

    if (!canServeMeal(selectedMeal, stock)) {
      setToast(`${selectedMeal.name} ran out. restock ingredients first.`)
      setSelectedMealId(null)
      return
    }

    if (selectedMeal.id !== customer.requestedMealId) {
      setScore((current) => Math.max(0, current - 5))
      setSelectedMealId(null)
      setToast('wrong meal. score penalty.')
      return
    }

    setStock((current) => {
      const next = { ...current }
      Object.entries(selectedMeal.ingredients).forEach(([ingredient, amount]) => {
        next[ingredient] = Math.max(0, next[ingredient] - amount)
      })
      return next
    })

    setQueue((current) => {
      const filtered = current.filter((item) => item.id !== customer.id)
      return filtered.length > 0 ? filtered : [createCustomer(customerIdRef.current++, difficulty)]
    })

    setScore((current) => current + 10)
    setSelectedMealId(null)
    setToast(`served ${customer.requestedMealName} successfully.`)
  }

  function restockIngredient(name) {
    setStock((current) => {
      const nextAmount = Math.min(MAX_STOCK, current[name] + 2)
      return { ...current, [name]: nextAmount }
    })
    setToast(`${name.toLowerCase()} restocked.`)
  }

  const hearts = useMemo(
    () => Array.from({ length: 3 }, (_, index) => index < lives),
    [lives]
  )

  return (
    <div className="game-screen dark-theme-screen">
      <header className="dark-hud">
        <div className="hud-pill">
          <span className="hud-icon">👤</span>
          <span className="hud-label">player</span>
          <span className="hud-value">{username}</span>
        </div>

        <div className="hud-pill">
          <span className="hud-icon">🍽️</span>
          <span className="hud-label">score</span>
          <span className="hud-value">{score}</span>
        </div>

        <div className="hud-pill">
          <span className="hud-icon">⏱️</span>
          <span className="hud-label">time</span>
          <span className="hud-value">{elapsed}s</span>
        </div>

        <div className="hud-pill lives-pill">
          <span className="hud-label">lives</span>
          <div className="hud-hearts">
            {hearts.map((full, index) => (
              <span key={index}>{full ? '❤️' : '🖤'}</span>
            ))}
          </div>
        </div>
      </header>

      <div className="fact-banner dark-fact-banner">
        <strong>UN SDG 2:</strong> {FOOD_FACTS[factIndex]}
      </div>

      <main className="hybrid-arena">
        <section className="queue-scene">
          <div className="scene-header">
            <h3>customer queue</h3>
            <span>serve the correct meal before patience runs out</span>
          </div>

          <div className="queue-lane">
            {queue.map((customer) => {
              const patiencePercent = getPatiencePercent(customer)
              const meal = MEALS.find((item) => item.id === customer.requestedMealId)

              return (
                <button
                  key={customer.id}
                  className="scene-customer"
                  onClick={() => handleCustomerClick(customer)}
                >
                  <div className="request-pill">
                    <span>{meal?.icon}</span>
                    <span>{customer.requestedMealName}</span>
                  </div>

                  <div className="human-figure-wrap">
                    <div
                      className="human-head"
                      style={{ backgroundColor: customer.look.head }}
                    >
                      <div
                        className="human-hair"
                        style={{ backgroundColor: customer.look.hair }}
                      />
                      <span className="human-face">{customer.look.emoji}</span>
                    </div>

                    <div
                      className="human-body"
                      style={{ backgroundColor: customer.look.body }}
                    />
                    <div className="human-shadow" />
                  </div>

                  <div className="customer-name">{customer.name}</div>

                  <div className="patience-bar dark-patience-bar">
                    <div
                      className="patience-fill"
                      style={{ width: `${patiencePercent}%` }}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <div className="gold-divider" />

        <section className="service-zone">
          <section className="meals-stage">
            <div className="panel-header dark-panel-header">
              <h3>meal stations</h3>
              <span>greyed out meals need ingredients</span>
            </div>

            <div className="station-grid">
              {MEALS.map((meal) => {
                const available = canServeMeal(meal, stock)

                return (
                  <button
                    key={meal.id}
                    className={[
                      'station-card',
                      selectedMealId === meal.id ? 'selected-station' : '',
                      !available ? 'disabled-station' : '',
                    ].join(' ')}
                    onClick={() => handleMealClick(meal)}
                  >
                    <div className="station-ring">
                      <div className="station-plate">{meal.icon}</div>
                    </div>

                    <div className="station-name">{meal.name}</div>

                    <div className="station-recipe">
                      {Object.entries(meal.ingredients).map(([ingredient, amount]) => (
                        <span key={ingredient}>
                          {ingredient}: {amount}
                        </span>
                      ))}
                    </div>

                    <div className="station-status">
                      {available ? 'ready to serve' : 'missing ingredients'}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <aside className="supply-stage">
            <div className="panel-header dark-panel-header">
              <h3>ingredient supply</h3>
            </div>

            <div className="ingredient-grid dark-ingredient-grid">
              {INGREDIENTS.map((ingredient) => (
                <button
                  key={ingredient}
                  className="ingredient-card compact-ingredient-card"
                  onClick={() => restockIngredient(ingredient)}
                >
                  <span className="ingredient-name">{ingredient}</span>
                  <strong>{stock[ingredient]}/{MAX_STOCK}</strong>
                  <div className="stock-bar">
                    <div
                      className="stock-fill"
                      style={{ width: `${(stock[ingredient] / MAX_STOCK) * 100}%` }}
                    />
                  </div>
                  <small>click to restock</small>
                </button>
              ))}
            </div>
          </aside>
        </section>
      </main>

      <footer className="toast-bar dark-toast-bar">{toast}</footer>
    </div>
  )
}