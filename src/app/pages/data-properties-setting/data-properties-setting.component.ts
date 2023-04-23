import { Component } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpServerService } from 'src/app/services/http-server.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, Observer } from 'rxjs';
import { NzUploadFile, NzUploadXHRArgs } from 'ng-zorro-antd/upload';
import { Urlserver } from 'src/app/constants/urlserver';


@Component({
  selector: 'app-data-properties-setting',
  templateUrl: './data-properties-setting.component.html',
  styleUrls: ['./data-properties-setting.component.scss']
})
export class DataPropertiesSettingComponent {
  validateForm!: UntypedFormGroup;
  validateFormEdit!: UntypedFormGroup;
  filterFurniture: any[] = [];
  filterStatus: any[] = [];
  filterNameProject: any[] = [];
  filterTypeProject: any[] = [];

  listOfData: any[] = [];
  total = 1;
  loadingData = true;
  uploading = false;
  pageSize = 1000;
  pageIndex = 1;
  idDataUploadImage: any;
  filterImages: any[] = [];

  controls = [
    { id: "Code", name: "Mã KH", placeholder: "Nhập mã KH" },
    { id: "House_Code", name: "Mã nhà", placeholder: "Nhập mã nhà" },
    { id: "Name", name: "Tên khách hàng", placeholder: "Nhập tên KH" },
    { id: "Phone", name: "Số điện thoại", placeholder: "Nhập số điện thoại" },
    { id: "Status", name: "Trạng thái", placeholder: "Chọn trạng thái", type: "select", valueSelect: this.filterStatus },
    { id: "VND_Rental", name: "Giá cho thuê (VNĐ)", placeholder: "Nhập giá cho thuê" },
    { id: "VND_Sale", name: "Giá bán (VNĐ)", placeholder: "Nhập giá bán" },
    { id: "USD_Rental", name: "Giá cho thuê (USD)", placeholder: "Nhập giá cho thuê" },
    { id: "USD_Sale", name: "Giá bán (VNĐ)", placeholder: "Nhập giá cho thuê" },
    { id: "Bathroom", name: "Số phòng tắm", placeholder: "Nhập số phòng tắm" },
    { id: "Bed", name: "Số giường", placeholder: "Nhấp số giường" },
    { id: "Renting_till", name: "Thời hạn cho thuê", placeholder: "Nhập thời hạn cho thuê" },
    { id: "Furniture", name: "Nội thất", placeholder: "Chọn nội thất", type: "select", valueSelect: this.filterFurniture },
    { id: "RoomNumber", name: "Số lượng phòng", placeholder: "Nhập số lượng phòng" },
    { id: "Tower", name: "Toà nhà", placeholder: "Nhập toà nhà" },
    { id: "Floor", name: "Lầu", placeholder: "Nhập lầu" },
    { id: "Pinkbook", name: "Sổ hồng", placeholder: "Nhập sổ hồng" },
    { id: "Email", name: "Email", placeholder: "Nhập email" },
    { id: "Address", name: "Địa chỉ", placeholder: "Nhập địa chỉ" },
    { id: "Sqm", name: "Diện tích", placeholder: "Nhập diện tích" },
    { id: "civil", name: "Dân dụng", placeholder: "Nhập dân dụng" },
    { id: "commission_rate", name: "Tỷ lệ hoa hồng", placeholder: "Nhập tỷ lệ hoa hồng" },
    { id: "Name_Type", name: "Tên loại", placeholder: "Chọn loại", type: "select", valueSelect: this.filterTypeProject },
    { id: "id_name_project", name: "Tên dự án", placeholder: "Chọn dự án", type: "select", valueSelect: this.filterNameProject }
  ]
  controlArray: Array<{ index: number; show: boolean; id: string; name: string, placeholder: string, type: string, valueSelect: any }> = [];
  controlArrayEdit: Array<{ index: number; show: boolean; id: string; name: string, placeholder: string, type: string, valueSelect: any }> = [];
  isCollapse = true;

  fileList: NzUploadFile[] = [];

  data: any[] = [];
  submitting = false;
  user = {
    author: 'Han Solo',
    avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
  };
  inputValue = '';
  filterNotes: Array<{ id_data: string; author: string; avatar: string; content: string; datetime: string }> = [];
  filterAddNotes: any[] = [];

  isVisibleModalAdd = false;
  isVisibleModalEdit = false;
  isVisibleModalNote = false;
  isVisibleModalImage = false;
  currentRecord: any;

  selectedValue = 1;

  resetForm(): void {
    this.validateForm.reset();
  }

  constructor(private fb: UntypedFormBuilder,
    private httpServerService: HttpServerService,
    private message: NzMessageService) { }

  ngOnInit(): void {
    this.loadListOfColumn();

    this.loadDataFromServer(this.pageIndex, this.pageSize, null);

    this.validateForm = this.fb.group({});
    this.validateFormEdit = this.fb.group({});
    
    for (let i = 0; i < this.controls.length; i++) {
      this.controlArray.push({ index: i, show: true, id: this.controls[i].id, name: this.controls[i].name, placeholder: this.controls[i].placeholder, type: this.controls[i].type ?? "default", valueSelect: this.controls[i].valueSelect });
      this.validateForm.addControl(`${this.controls[i].id}`, new UntypedFormControl());

      this.controlArrayEdit.push({ index: i, show: true, id: this.controls[i].id, name: this.controls[i].name, placeholder: this.controls[i].placeholder, type: this.controls[i].type ?? "default", valueSelect: this.controls[i].valueSelect });
      this.validateFormEdit.addControl(`${this.controls[i].id}`, new UntypedFormControl());
    }

    this.validateFormEdit.addControl('id_data_properties', new UntypedFormControl());
  }

  loadDataFromServer(
    pageIndex: number,
    pageSize: number,
    sortOrder: string | null,
  ): void {
    this.loadingData = true;

    // Get data
    this.httpServerService.getModDataProperties(pageIndex, pageSize, sortOrder)
    .subscribe(data => {
      this.loadingData = false;
      this.total = data.total_data;
      this.listOfData = data.result;
      
      this.makeFilterImages();
      this.makeFilterNotes();
    });
  }

  public loadListOfColumn(): void {
    this.httpServerService.getFurnitureList().subscribe(data => {
      if (data && data.success) {
        data.result.forEach((element: any) => {
          this.filterFurniture.push({ text: element.furniture_name, value: element.id });
        })
      }
    });

    this.httpServerService.getStatusList().subscribe(data => {
      if (data && data.success) {
        data.result.forEach((element: any) => {
          this.filterStatus.push({ text: element.status_name, value: element.id });
        })
      }
    });

    this.httpServerService.getNameProject().subscribe(data => {
      if (data && data.success) {
        console.log(data);
        
        data.result.forEach((element: any) => {
          this.filterNameProject.push({ text: element.name_project, value: element.id });
        })
      }
    });

    this.httpServerService.getTypeProject().subscribe(data => {
      if (data && data.success) {        
        data.result.forEach((element: any) => {
          this.filterTypeProject.push({ text: element.note, value: element.id });
        })
      }
    });
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      const formData = new FormData();
      let values = this.validateForm.value;

      this.controls.forEach((control: any) => {
        if (control.type === 'select') {
          values[control.id] = parseInt(values[control.id]);
        }
      })

      let dataJson = JSON.stringify(values);

      formData.append('data', dataJson);
      this.fileList.forEach((file: any) => {
        formData.append('images', file);
      });

      this.httpServerService.createDataProperties(formData).subscribe(data => {
        if (data && data.success) {
          this.message.success(`Tạo thành công!`);
          this.loadDataFromServer(this.pageIndex, this.pageSize, null);
        } else {
          this.message.error(`Tạo thất bại!`);
        }
      });
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = this.fileList.concat(file);
    return false;
  };

  getValueById(list: any[], id: string): string {
    return list.filter(x => x.value == id)[0]?.text;
  }

  getNotesByIdData(idData: string): Array<any> {
    return this.filterNotes.filter(note => note.id_data === idData).reverse();
  }

  handleSubmit(id_data: number): void {
    const content = this.filterAddNotes[id_data];
    console.log(content);
    
    if (!content) {
      return;
    }

    this.httpServerService.insertNote(id_data, content)
      .subscribe(res => {
        if (res && res.success === true) {
          this.loadDataFromServer(this.pageIndex, this.pageSize, null);
          this.message.success("Thêm ghi chú thành công!");
          this.filterAddNotes[id_data] = '';
        }
      });
  }

  customUploadReq = (item: NzUploadXHRArgs) => {

    const formData = new FormData();
    formData.append('data', `{"id_data_properties":${this.idDataUploadImage}}`);
    formData.append('images', item.file as any, item.file.name);

    return this.httpServerService.uploadImage(formData).subscribe(data => {
      if (data && data.success) {
        this.updateImageById(this.idDataUploadImage, data.Image);
        this.message.success(`Tải hình ảnh lên thành công.`);
      } else {
        this.message.error(`Tải hình ảnh lên thất bại.`);
      }
    });
  }

  makeFilterImages(): void {
    let images: any[] = [];
    let urlImages: string[] = [];

    this.listOfData.forEach(item => {
      urlImages = [];
      item.Image.forEach((image: string) => {
        urlImages.push(`${Urlserver.URL_GET_IMAGE}${image}`)
      });

      images.push(
        {
          uid: item.id,
          urls: urlImages
        })
    });

    this.filterImages = images;
  }

  makeFilterNotes(): void {
    console.log(this.listOfData);
    let addNotes: any[] = [];

    this.listOfData.forEach(item => {
      if (Array.isArray(item.Note)){
        item.Note.forEach((note: any) => {
          note.note.forEach((subNote: any) => {
            this.filterNotes.push({ id_data: item.id, author: note.name, avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png', content: subNote.content, datetime: subNote.note_time })
          })
        });
  
        this.filterAddNotes.push('');
      }
    });
  }

  updateImageById(idData: string, Image: any) {
    let urlImages: string[] = [];
    Image.forEach((image: string) => {
      urlImages.push(`${Urlserver.URL_GET_IMAGE}${image}`)
    });
    this.filterImages.find(image => image.uid === idData).urls = urlImages;
  }

  getImageById(idData: any) {
    return this.filterImages.find(image => image.uid === idData).urls;
  }

  setData(id: string, data: any): void {
    console.log(data);

    this.idDataUploadImage = id;
  }

  isArray(data: any): boolean {
    return Array.isArray(data);
  }

  pupolateData(data: any): void {
    this.controls.forEach(control => {
      this.validateFormEdit.controls[control.id].setValue(data[control.id].toString());
    })
    
    this.validateFormEdit.controls['id_data_properties'].setValue(data.id);
  }

  countNotesByIdData(idData: string): number {
    let notes = this.getNotesByIdData(idData);
    return notes.length;
  }

  countImagesByIdData(idData: string): number {
    let images = this.getImageById(idData);
    return images.length;
  }

  showModalNote(data: any): void {
    this.currentRecord = data;
    this.controls.forEach(control => {
      this.validateForm.controls[control.id].setValue(data[control.id]);
    })

    this.isVisibleModalNote = true;
  }

  handleCancelModalNote(): void {
    this.isVisibleModalNote = false;
  }

  showModalImage(data: any): void {
    this.currentRecord = data;
    this.controls.forEach(control => {
      this.validateForm.controls[control.id].setValue(data[control.id]);
    })
    this.isVisibleModalImage = true;
  }

  handleCancelModalImage(): void {
    this.isVisibleModalImage = false;
  }

  showAddNew(): void {
    this.isVisibleModalAdd = true;
  }

  showEdit(): void {
    this.isVisibleModalEdit = true;
  }

  handleCancelModalAdd(): void {
    this.isVisibleModalAdd = false;
  }

  handleCancelModalEdit(): void {
    this.isVisibleModalEdit = false;
  }

  submitFormEdit(): void {
    if (this.validateFormEdit.valid) {
      const formData = new FormData();
      let values = this.validateFormEdit.value;

      console.log(values);
      

      this.controls.forEach((control: any) => {
        if (control.type === 'select') {
          values[control.id] = parseInt(values[control.id]);
        }
      })

      let dataJson = JSON.stringify(values);

      formData.append('data', dataJson);
      this.fileList.forEach((file: any) => {
        formData.append('images', file);
      });

      this.httpServerService.updateDataProperties(formData).subscribe(data => {
        if (data && data.success) {
          this.message.success(`Chỉnh sửa thông tin thành công.`);
          this.isVisibleModalEdit = false;
          this.loadDataFromServer(this.pageIndex, this.pageSize, null);
        } else {
          this.message.error(`Chỉnh sửa thông tin thất bại.`);
        }
      });
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
