import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Course } from "../model/course";
import { CoursesService } from "../services/courses.service";
import {
  debounceTime,
  distinctUntilChanged,
  startWith,
  tap,
  delay,
  catchError,
  finalize,
} from "rxjs/operators";
import { merge, fromEvent, Observable, throwError, of } from "rxjs";
import { Lesson } from "../model/lesson";
import { SelectionModel } from "@angular/cdk/collections";

@Component({
  selector: "course",
  templateUrl: "./course.component.html",
  styleUrls: ["./course.component.scss"],
})
export class CourseComponent implements OnInit, AfterViewInit {
  course: Course;

  // lessons$ = of([
  //   {
  //     id: 120,
  //     description: "Introduction to Angular Material",
  //     duration: "4:17",
  //     seqNo: 1,
  //     courseId: 11,
  //   },
  //   {
  //     id: 121,
  //     description: "Navigation and Containers",
  //     duration: "6:37",
  //     seqNo: 2,
  //     courseId: 11,
  //   },
  //   {
  //     id: 122,
  //     description: "Data Tables",
  //     duration: "8:03",
  //     seqNo: 3,
  //     courseId: 11,
  //   },
  //   {
  //     id: 123,
  //     description: "Dialogs and Overlays",
  //     duration: "11:46",
  //     seqNo: 4,
  //     courseId: 11,
  //   },
  //   {
  //     id: 124,
  //     description: "Commonly used Form Controls",
  //     duration: "7:17",
  //     seqNo: 5,
  //     courseId: 11,
  //   },
  //   {
  //     id: 125,
  //     description: "Drag and Drop",
  //     duration: "8:16",
  //     seqNo: 6,
  //     courseId: 11,
  //   },
  //   {
  //     id: 126,
  //     description: "Responsive Design",
  //     duration: "7:28",
  //     seqNo: 7,
  //     courseId: 11,
  //   },
  //   {
  //     id: 127,
  //     description: "Tree Component",
  //     duration: "11:09",
  //     seqNo: 8,
  //     courseId: 11,
  //   },
  //   {
  //     id: 128,
  //     description: "Virtual Scrolling",
  //     duration: "3:44",
  //     seqNo: 9,
  //     courseId: 11,
  //   },
  //   {
  //     id: 129,
  //     description: "Custom Themes",
  //     duration: "8:55",
  //     seqNo: 10,
  //     courseId: 11,
  //   },
  //   {
  //     id: 130,
  //     description: "Changing Theme at Runtime",
  //     duration: "12:37",
  //     seqNo: 11,
  //     courseId: 11,
  //   },
  // ]);

  // @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  paginator: MatPaginator;

  @ViewChild("paginator", { static: false }) set content(
    content: MatPaginator
  ) {
    if (content) {
      // initially setter gets called with undefined
      console.log("here", content);
      this.paginator = content;
    }
  }

  @ViewChild(MatSort, { static: false })
  sort: MatSort;

  expandedLesson: Lesson = null;
  lessons: Lesson[];
  isLoading: boolean = false;

  displayedColumns = ["select", "seqNo", "description", "duration"];
  selection = new SelectionModel<Lesson>(true);
  constructor(
    private route: ActivatedRoute,
    private coursesService: CoursesService
  ) {}

  ngOnInit() {
    this.course = this.route.snapshot.data["course"];
    console.log(this.course);
    this.loadLessonsPage();
  }

  loadLessonsPage() {
    this.isLoading = true;
    console.log(this.paginator?.pageIndex + "index", this.paginator?.pageSize);
    this.coursesService
      .findLessons(
        this.course.id,
        this.sort?.direction ?? "asc",
        this.paginator?.pageIndex ?? 0,
        this.paginator?.pageSize ?? 3,
        this.sort?.active ?? "seqNo"
      )
      .pipe(
        tap((lessons) => (this.lessons = lessons)),
        catchError((err) => {
          console.log("Error loading lessons", err);
          alert("Error loading lessons.");
          return throwError(err);
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe();
  }

  onToggleLesson(lesson: Lesson) {
    if (lesson == this.expandedLesson) {
      this.expandedLesson = null;
      return;
    }

    this.expandedLesson = lesson;
  }

  onLessonToggled(lesson: Lesson) {
    this.selection.toggle(lesson);

    console.log(this.selection.selected);
  }
  isAllSelected(): boolean {
    return this.selection.selected?.length === this.lessons?.length;
  }
  toggleAll() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.lessons);
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.loadLessonsPage()))
      .subscribe();
  }
}
