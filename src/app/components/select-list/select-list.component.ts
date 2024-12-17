import { NgForOf, NgIf } from '@angular/common'
import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2 } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatCheckbox } from "@angular/material/checkbox"
import { IndexeddbService } from '../../services/indexeddb.service'
import type { Category } from '../types/category'

@Component({
  selector: 'app-select-list',
  imports: [NgIf, NgForOf, MatCheckbox, FormsModule],
  templateUrl: './select-list.component.html',
  styleUrl: './select-list.component.scss'
})
export class SelectListComponent implements OnInit {

  isDropdownOpen: boolean = false;
  isSelectAll: boolean = false;
  isIndeterminate: boolean = false;
  isSelectedAny: boolean = false;
  categories: Category[] = [];
  selectedSummary: string = 'Выбрано 0 элементов'

  constructor(
    private indexeddbService: IndexeddbService, 
    private cdr: ChangeDetectorRef
  ) {}

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const dropdown = document.querySelector('.select-list-container');
    if (dropdown && !dropdown.contains(event.target as Node)) {
      this.isDropdownOpen = false;
      this.cdr.detectChanges();  // Явно обновляем состояние
    }
  }

  ngOnInit() {
    this.loadInitialData();
  }

  async loadInitialData() {
    this.categories = [
      {
        name: 'Продажи',
        selected: false,
        isExpanded: true,
        items: [
          { name: 'Неразобранное', selected: true, 
            color: '#99CCFD' },
          {
            name: 'Переговоры', selected: true,
            color: '#FFFF99'
          },
          {
            name: 'Принимают решение', selected: true,
            color: '#FFCC66'
          },
          {
            name: 'Успешно', selected: true,
            color: '#CCFF66'
          },
        ],
      },
      {
        name: 'Сотрудники',
        selected: false,
        isExpanded: false,
        items: [
          {
            name: 'HR', selected: false,
            color: '#CCFF66'
          }, 
          {
            name: 'Интервью', selected: false,
            color: '#FFFF99'
          }
        ],
      },
      {
        name: 'Партнёры',
        selected: false,
        isExpanded: false,
        items: [
          {
            name: 'Названия', selected: false,
            color: '#CCFF66'
          }, 
          {
            name: 'Контакты', selected: false,
            color: '#FFFF99'
          }
        ],
      },
      {
        name: 'Ивент',
        selected: false,
        isExpanded: false,
        items: [
          {
            name: 'Названия', selected: false,
            color: '#FFFF99'
          }, 
          {
            name: 'Даты', selected: false,
            color: '#CCFF66'
          }
        ],
      },
      {
        name: 'Входящие обращения',
        selected: false,
        isExpanded: false,
        items: [
          {
            name: 'Решения', selected: false,
            color: '#CCFF66'
          }, 
          {
            name: 'Успешно', selected: false,
            color: '#99CCFD'
          }
        ],
      },
    ];

    const savedState = await this.indexeddbService.loadState();
    if (savedState) {
      this.restoreState(savedState);
    }
    this.updateSummary();
  }

  async saveState() {
    await this.indexeddbService.saveState(this.categories);
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (!this.isDropdownOpen) {
      this.saveState()
    }
    this.cdr.detectChanges();
  }

  restoreState(savedState: any) {
    this.categories = savedState.selectedItems;
  }

  toggleListItems(category: Category) {
    this.categories.forEach((item) => {
      if (item === category) {
        item.isExpanded = !item.isExpanded
      } else {
        item.isExpanded = false
      }
    })
  }

  toggleCategory(category: Category) {
    category.isExpanded = !category.isExpanded;
  }

  isNoneSelected(): boolean {
    return this.categories.every(category => 
      category.items.every(item => !item.selected)
    );
  }

  isAnySelected(): boolean {
    return this.categories.some(category => 
      category.items.some(item => item.selected)
    );
  }

  selectAll() {
    this.isSelectAll = true;
    this.isIndeterminate = false;
    this.categories.forEach(category => {
      category.selected = true;
      category.items.forEach(item => item.selected = true);
    });
    this.updateSummary();
    this.saveState();
  }
  
  clearAll() {
    this.isSelectAll = false;
    this.isIndeterminate = false;
    this.categories.forEach(category => {
      category.selected = false;
      category.items.forEach(item => item.selected = false);
    });
    this.updateSummary();
    this.saveState();
  }

  onSelectAllChange(event: any) {
    this.isSelectAll = event.checked;
    this.categories.forEach(category => {
      category.selected = this.isSelectAll;
      category.items.forEach(item => item.selected = this.isSelectAll);
    });
    this.isIndeterminate = false;
    this.updateSummary();
    this.saveState();
  }

  onCategoryChange(category: Category) {
    category.items.forEach((item) => (item.selected = category.selected));
    this.updateSummary();
    this.saveState();
  }

  onItemChange() {
    this.categories.forEach((category) => {
      category.selected = category.items.every((item) => item.selected);
    });
    this.updateSummary();
    this.saveState();
  }

  updateSummary() {
    let totalSelected: number = 0;
    let categoriesSelected: number = 0;
    let totalItems: number = 0;

    if (this.categories) {
      this.categories.forEach(category => {
        const selectedItems = category.items.filter(item => item.selected).length;
        const categoryItems = category.items.length;
  
        totalItems += categoryItems;
  
        if (selectedItems > 0) {
          categoriesSelected++;
          totalSelected += selectedItems;
        }
      });
    }

    this.isSelectAll = totalSelected === totalItems;
    this.isIndeterminate = totalSelected > 0 && totalSelected < totalItems;
    this.selectedSummary = `Выбрано: ${categoriesSelected} воронки, ${totalSelected} этапов`;
  }
}