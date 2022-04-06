const { isSeatEmpty, isValidNeighbour, getNeighbourQuestions, getArraySum, printLayout } = require('./utils')
const setA = [];
for (let i = 1; i <= 10; i++)
  setA.push(i)

const setB = [];
for (let i = 11; i <= 20; i++)
  setB.push(i)

const POPULATION_SIZE = 100;
const GENERATION_LIMIT = 500;
const MUTATION_RATE = 0.06;
const TOTAL_NUMBER_OF_QUESTIONS = 25;
const QUESTIONS_IN_QUIZ = 20;
const ROWS = 10;
const COLUMNS = 8;
const NUMBER_OF_STUDENTS = 72;
const EMPTY_SEATS = ROWS * COLUMNS - NUMBER_OF_STUDENTS;

const initialSolution = []

// Allocate student to seat number
for (let row = 0, rollNumber = 1; row < ROWS; row++) {
  for (let column = 0; column < COLUMNS; column++) {
    if (rollNumber > NUMBER_OF_STUDENTS) {
      initialSolution.push([row, column, [null, []]]);
      continue;
    }
    const questions = rollNumber % 2 === 0 ? setB : setA;
    initialSolution.push([row, column, [rollNumber++, questions]])
  }
}

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

    // Create mapping for current gene's questions
    const geneQuestions = {}
    for (question of questions) geneQuestions[question] = true;

    const commonQuestions = [];

    // Check common questions between gene and each neighbour
    for (neighbour of validNeighbourQuestions) {
      // Common questions for current gene (seat)
      let currentCommonQuestions = 0;
      for (question of neighbour) {
        if (geneQuestions[question]) currentCommonQuestions++;
      }
      commonQuestions.push(currentCommonQuestions);
    }
    // Return maximum number of common questions
    return Math.max(...commonQuestions);
  })

  // Get average number of common questions for a seat (gene) in this chromosome
  let fitness = getArraySum(fitnessForEachGene) / NUMBER_OF_STUDENTS;
  // We need to minimize this fitness so take inverse
  fitness = 1 / (fitness);
  return { solution: chromosome, fitness }
}

const solution = fitnessFunction(initialSolution)
console.log(solution.fitness)
printLayout(solution.solution, ROWS, COLUMNS)