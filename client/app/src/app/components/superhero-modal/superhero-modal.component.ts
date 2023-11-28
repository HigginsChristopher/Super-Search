import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Superhero } from '../../superhero';

@Component({
  selector: 'app-superhero-modal',
  templateUrl: './superhero-modal.component.html',
  styleUrl: './superhero-modal.component.css'
})
export class SuperheroModalComponent implements OnInit{
  @Input() superhero!: Superhero;
  @Output() closeModal = new EventEmitter<void>();
  faTimes = faTimes;

  ngOnInit(): void {
    document.body.classList.add('modal-open');
  }

  onCloseModal(): void {
    document.body.classList.remove('modal-open');
    this.closeModal.emit();
  }
}
