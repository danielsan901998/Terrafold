# TODO List

## Core Game Mechanics & Systems
*   **Computer**
    *   Make showing a boolean instead of a function, use events to update visibility.
    *   Diferenciate done between repetable like Build Robots and Bigger Storms, only unassign threads for no repetible
    *   Modify Bigger Storms
        *   Unlocks Targetted Sunlight (Improves ice melting rate, 10% at a time up to 100%)
            *   Disappears when Complete
            *   Unlocks Targetted Humidity (Grow ferns faster, 10% at a time up to 100%)
                *   Disappears when complete
*   **Robots**
    *   More Robot Storage
        *   Costs 250 land, Metal
        *   Stores 1 robot
    *   Modify Build Mines
        *   Faster tick cost increase
        *   Lower limit - floor(square(land)/10)
        *   Show how many there are
    *   Remove Turn ore into dirt
    *   Stuff Ore Into Compactor
        *   Expensive on ticks, no cost otherwise
        *   Puts 1% of ore into compacted storage
    *   Build Factory
        *   Single completion, unlock 
    *   Has Compacted Ore
    *   Grind Ore
        *   Takes flat compacted ore #
        *   Light on ticks, heavy on flat energy required
        *   Produces little dirt, littler gems
*   **Space Station**
    *   Build solar panel, fixed energy production if energy less than battery, metal cost
    *   Increase Hangar change to metal cost.
*   **Potential Upgrades**
    *   Increase max # of mines per planet, make it choosable down to 1
*   **Ice Upgrade Idea**
    *   Each ice upgrade would be +1 + 0.1%, or something like that -- a small constant for the early game, and a percentage upgrade for late game
*   **Factory/Orbital Factory**
    *   Unlocked after Grind Ore, use gems to build laser, new cost for Ship. Replace Targetted Sunlight research

## Game Progression & Flow
*   **Next Sector**
    *   Killing bosses give void crystals

## Balance, Economy & Design Philosophy
*   **Ore/Dirt Balance**
    *   400 ore per tick is reasonable to obtain.
    *   5 dirt in 500 ticks (1 in 10 ticks, or .1 per tick) is likely too low compared to space station supply (250 ticks for 5 dirt might be on par).
    *   Recommendation: 400 ore per tick, 250 ticks per 5 dirt.
    *   Planets only have a small amount of dirt to send. Mine enough ore for 2 construction bots, which build solar panels to power the coil gun.
*   **Farming & Water Economy**
    *   Merge Ice Storage container
    *   Merge Land and Lake container
    *   Happiness is a straight multiplier to production, without increasing water consumption.
    *   Improving farms increases production at the cost of increasing water consumption.
    *   Base farm behavior: 10 pop = 0.1 base production/tick, or 100 ticks to produce population. 0.01 food -> 0.01 output.
    *   Understanding: 1 water -> 1 food -> 1 unit of production ($1 or 1 sci).
    *   Early game implication: Selling water for $2 is more profitable than farming unless pushing happiness/improving house.
    *   Farms/people is a bad way to go unless pushing happiness.
    *   More profitable to sell ice (at least early on).
*   **Player Progression & Interstellar Travel**
    *   Observation: 8000 farms, 83k trees, massive space-dirt-enhanced world, barely sending 2 ships for damage.
    *   Comets/asteroids need tuning down. Water/farms needed needs to go way down. Minerals into dirt needs to be viable.
    *   Planet progression idea: First system has small planets, second system has bigger/defended, later systems rely on inter-galactic ice transport.
    *   Questioning interstellar drive origin: How are they made from junk with few people and rapid birth rate? (Trimp analogy noted: high reproduction, cobbling stations/portals, high desire to fight).
*   **Ice Market & End Game**
    *   Ice market supply challenge: 1000 water on farms needs 1M ice, which needs 100M ice in the space station. How does the market supply this? (Comet deposition? ~1897 per tick = comet every 2 mins).
    *   End-game requires way too much water.
