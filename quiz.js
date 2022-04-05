const { getRandomQuestions, shuffleChromosome, isSeatEmpty, isValidNeighbour, getNeighbourQuestions, getArraySum, shuffleMatingPool, calculateAverageFitnessForGeneration, printLayout } = require('./utils')
const { selection, crossover, mutation } = require("./GAutils")

// Input -> Room: {no. of rows, no. of columns}, Student: { roll no. }, Questions: { total number of questions, number of questions to be alloted }
// Gene structure -> [row no., column no., [roll no., questions]]
const POPULATION_SIZE = 300;
const GENERATION_LIMIT = 300;
const MUTATION_RATE = 0.05;
const TOTAL_NUMBER_OF_QUESTIONS = 20;
const QUESTIONS_IN_QUIZ = 10;
const ROWS = 20;
const COLUMNS = 3;
const NUMBER_OF_STUDENTS = 60;
const EMPTY_SEATS = ROWS * COLUMNS - NUMBER_OF_STUDENTS;

function fitnessFunction(chromosome) {
  // Get number of common questions for each seat
  const fitnessForEachGene = chromosome.map(gene => {
    // Gene contains [row, column, roll no., [questions]]
    const row = gene[0];
    const column = gene[1];
    const rollNumber = gene[2][0];
    const questions = gene[2][1];

    // Check if seat is unoccupied
    if (isSeatEmpty(gene)) return 0;

    // Get neighbours of a particular seat
    const neighbours = [[row - 1, column], [row, column - 1], [row, column + 1], [row + 1, column],
    [row - 1, column + 1], [row - 1, column - 1], [row + 1, column - 1], [row + 1, column + 1]];

    const validNeighbours = neighbours.filter(neighbour => isValidNeighbour(neighbour, [ROWS, COLUMNS]));

    const validNeighbourQuestions = validNeighbours.map(neighbour => getNeighbourQuestions(chromosome, neighbour, ROWS));

    // Common questions for current gene (seat)
    let commonQuestions = 0;

    // Create mapping for current gene's questions
    const geneQuestions = {}
    for (question of questions) geneQuestions[question] = true;

    // Check common questions between gene and each neighbour
    for (neighbour of validNeighbourQuestions) {
      for (question of neighbour) {
        if (geneQuestions[question]) commonQuestions++;
      }
    }
    // Return avg. common questions between neighbour and seat
    return commonQuestions;
  })

  // Get average number of common questions for a seat (gene) in this chromosome
  let fitness = getArraySum(fitnessForEachGene) / NUMBER_OF_STUDENTS;
  // We need to minimize this fitness so take inverse
  fitness = 1 / (fitness);
  return { solution: chromosome, fitness }
}

function quiz() {
  const initialSolution = [];

  // Allocate student to seat number
  for (let row = 0, rollNumber = 1; row < ROWS; row++) {
    for (let column = 0; column < COLUMNS; column++) {
      if (rollNumber > NUMBER_OF_STUDENTS) {
        initialSolution.push([row, column, [null, []]]);
        continue;
      }
      initialSolution.push([row, column, [rollNumber++, [...getRandomQuestions(TOTAL_NUMBER_OF_QUESTIONS, QUESTIONS_IN_QUIZ)]]])
    }
  }

  // Create population array
  const population = []
  population.push(initialSolution);

  // Create initial population by shuffling up first solution
  for (let i = 0; i < POPULATION_SIZE - 1; i++) {
    // Make deep copy of initial solution
    const chromosome = JSON.parse(JSON.stringify(initialSolution));

    // Shuffle questions and add to array
    const newChromosome = shuffleChromosome(chromosome);
    population.push(newChromosome);
  }

  let currentGeneration = 1;
  // Start iterating through generations
  while (currentGeneration <= GENERATION_LIMIT) {

    const populationWithCalculatedFitness = population.map(solution => fitnessFunction(solution))

    // Calculate average fitness for a generation and print it
    const averageGenerationFitness = calculateAverageFitnessForGeneration(populationWithCalculatedFitness, POPULATION_SIZE)
    console.log(`Generation: ${currentGeneration}\nAverage fitness: ${averageGenerationFitness}`)

    // Sort solutions in a population based on fitness
    populationWithCalculatedFitness.sort((a, b) => {
      return b.fitness - a.fitness;
    })

    // Build mating pool
    const [matingPool, nextPopulation] = selection(populationWithCalculatedFitness, 20, POPULATION_SIZE);

    // While next population is not full, keep generating offsprings using random parents from mating pool
    while (nextPopulation.length < POPULATION_SIZE) {
      // Create copy of mating pool to get random elements out of it
      const copyMatingPool = shuffleMatingPool(matingPool);

      // Crossover using first 2 elements of shuffled mating pool
      const offspringA = crossover(copyMatingPool[0], copyMatingPool[1]);
      const offspringB = crossover(copyMatingPool[1], copyMatingPool[0]);

      // Mutate offspring 1 and 2 here
      const mutatedOffspringA = mutation(offspringA, MUTATION_RATE, EMPTY_SEATS);
      const mutatedOffspringB = mutation(offspringB, MUTATION_RATE, EMPTY_SEATS);

      nextPopulation.push(mutatedOffspringA, mutatedOffspringB);
    }

    // Clear previous population
    population.length = 0;

    // Add all offsprings to the population
    population.push(...nextPopulation);

    currentGeneration++;
  }

  const bestPopulation = population.map(solution => fitnessFunction(solution))
  bestPopulation.sort((a, b) => {
    return b.fitness - a.fitness;
  })

  var bestSolution = bestPopulation[0];
  var maxFitness = bestSolution.fitness;
  for (let i = 0; i < POPULATION_SIZE; i++) {
    if (bestPopulation[i].fitness > maxFitness)
      bestSolution = bestPopulation[i]
  }

  console.log(bestSolution.fitness);
  printLayout(bestSolution.solution, ROWS, COLUMNS)
}

console.time("start")
quiz();
console.timeEnd("start")