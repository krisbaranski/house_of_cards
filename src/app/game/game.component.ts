import { Component, OnInit } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { EditPlayerComponent } from '../edit-player/edit-player.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  game!: Game;
  gameId!: string;

  constructor(
    private route: ActivatedRoute,
    private firestore: AngularFirestore,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.newGame();
    this.route.params.subscribe((params) => {
      //console.log(params['id']);
      this.gameId = params['id'];
      this.firestore
        .collection('games')
        .doc(this.gameId)
        .valueChanges()
        .subscribe((game: any) => {
          console.log('Game update', game);
          this.game.currentPlayer = game.currentPlayer;
          this.game.playedCards = game.playedCards;
          this.game.players = game.players;
          this.game.player_images = game.player_images;
          this.game.stack = game.stack;
          this.game.pickCardAnimation = game.pickCardAnimtation;
          this.game.currentCard = game.currentCard;
        });
    });
  }

  newGame() {
    this.game = new Game();
  }

  pickCard() {
    if (this.game.players.length > 1) {
      if (!this.game.pickCardAnimation) {
        // pop gibt letzten wert aus array & entfernt es aus dem array
        this.game.currentCard = this.game.stack.pop()!;
        this.game.pickCardAnimation = true;

        // if (this.game.playedCards.length > 5) {
        // }

        setTimeout(() => {
          this.game.currentPlayer++;
          this.game.currentPlayer =
            this.game.currentPlayer % this.game.players.length;
        }, 2000);

        this.saveGame();

        setTimeout(() => {
          this.game.playedCards.push(this.game.currentCard);
          this.game.pickCardAnimation = false;
          this.saveGame();
        }, 1000);
      }
    }
  }

  editPlayer(playerId: number) {
    console.log('Edit player', playerId);
    const dialogRef = this.dialog.open(EditPlayerComponent);

    dialogRef.afterClosed().subscribe((change: string) => {
      if (change) {
        if (change == 'DELETE') {
        } else {
          console.log('Received change', change);
          this.game.player_images[playerId] = change;
          this.saveGame();
        }
      }
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name && name.length > 0) {
        // check ob die variable name existiert und wenn sie existiert ob sie größer als 0 ist
        this.game.players.push(name);
        this.game.player_images.push('m1.png');
        this.saveGame();
      }
    });
  }

  saveGame() {
    this.firestore
      .collection('games')
      .doc(this.gameId)
      .update(this.game.toJson());
  }
}
