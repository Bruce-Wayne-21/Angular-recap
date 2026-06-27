import { Component, HostListener, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {
  boardSize = 20;
  snake = signal([{ x: 10, y: 10 }]);
  food = signal({ x: 15, y: 15 });
  direction = { x: 0, y: -1 }; // Start moving UP
  nextDirection = { x: 0, y: -1 };
  isGameOver = signal(false);
  score = signal(0);
  intervalId: any;
  gameSpeed = 150;

  ngOnInit() {
    this.startGame();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startGame() {
    this.snake.set([{ x: 10, y: 10 }]);
    this.direction = { x: 0, y: -1 };
    this.nextDirection = { x: 0, y: -1 };
    this.isGameOver.set(false);
    this.score.set(0);
    this.gameSpeed = 150;
    this.placeFood();
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.gameLoop(), this.gameSpeed);
  }

  gameLoop() {
    if (this.isGameOver()) return;

    this.direction = this.nextDirection;
    const currentSnake = this.snake();
    const head = { ...currentSnake[0] };

    head.x += this.direction.x;
    head.y += this.direction.y;

    // Check collisions
    if (this.checkCollision(head)) {
      this.isGameOver.set(true);
      clearInterval(this.intervalId);
      return;
    }

    const newSnake = [head, ...currentSnake];

    // Check food
    if (head.x === this.food().x && head.y === this.food().y) {
      this.score.update(s => s + 10);
      this.placeFood();
      // Increase speed slightly
      if (this.gameSpeed > 50) {
        this.gameSpeed -= 2;
        clearInterval(this.intervalId);
        this.intervalId = setInterval(() => this.gameLoop(), this.gameSpeed);
      }
    } else {
      newSnake.pop(); // Remove tail if not eaten food
    }

    this.snake.set(newSnake);
  }

  checkCollision(head: { x: number; y: number }): boolean {
    // Wall collision
    if (head.x < 0 || head.x >= this.boardSize || head.y < 0 || head.y >= this.boardSize) {
      return true;
    }
    // Self collision
    return this.snake().some(segment => segment.x === head.x && segment.y === head.y);
  }

  placeFood() {
    let newFood: { x: number; y: number };
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * this.boardSize),
        y: Math.floor(Math.random() * this.boardSize)
      };
      // Make sure food is not on snake
      if (!this.snake().some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    this.food.set(newFood);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.isGameOver() && event.key === 'Enter') {
      this.startGame();
      return;
    }

    switch (event.key) {
      case 'ArrowUp':
      case 'w':
        if (this.direction.y !== 1) this.nextDirection = { x: 0, y: -1 };
        break;
      case 'ArrowDown':
      case 's':
        if (this.direction.y !== -1) this.nextDirection = { x: 0, y: 1 };
        break;
      case 'ArrowLeft':
      case 'a':
        if (this.direction.x !== 1) this.nextDirection = { x: -1, y: 0 };
        break;
      case 'ArrowRight':
      case 'd':
        if (this.direction.x !== -1) this.nextDirection = { x: 1, y: 0 };
        break;
    }
  }

  getBoardRows() {
    return Array.from({ length: this.boardSize }, (_, i) => i);
  }

  getBoardCols() {
    return Array.from({ length: this.boardSize }, (_, i) => i);
  }

  isSnakeSegment(x: number, y: number): boolean {
    return this.snake().some(segment => segment.x === x && segment.y === y);
  }

  isFood(x: number, y: number): boolean {
    return this.food().x === x && this.food().y === y;
  }
}
