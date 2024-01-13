import React, { Fragment, useState, useEffect } from 'react'
import CreateForm from './components/CreateForm'
import { showSnackBar } from '../../redux/actions/snackBarActions';
import TopSpinner from '../../components/Spinner/TopSpinner';
import { useDispatch } from 'react-redux';
import { ContentBox } from '../../styles/AppStyles';
import { post, get, remove } from '../../services/Common';
import { BACKEND_URL } from '../../core/constants';
import EditForm from './components/EditForm';
import ConfirmDialog from '../../components/Dialogs/ConfirmDialog';
import { Pagination } from 'antd';
import { Input, Space } from 'antd';

const { Search } = Input;

const User = () => {
  const dispatch = useDispatch()
  const [toggleNew, settoggleNew] = useState("list")
  const [users, setusers] = useState([])
  const [bulkselected, setbulkselected] = useState([])
  const [totalusers, settotalusers] = useState(0)
  const [loading, setloading] = useState(false)
  const [selectedUser, setselectedUser] = useState(null)
  const [searchvalue, setsearchvalue] = useState(null)
  const [current, setCurrent] = useState(3);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkaction, setbulkaction] = useState(null)


  useEffect(() => {
    fetchAllUsers()
  }, [])

  const resetStates = () => {
    setbulkselected([])
    setloading(false)
    setDialogOpen(false)
    setbulkaction(null)
    let ele = document.getElementsByName('child_checkbox')
    for (let i = 0; i < ele.length; i++) {
      if (ele[i].type === 'checkbox')
        ele[i].checked = false;
    }
  }

  const fetchAllUsers = async (sortOrder = false, page = 1, limit = 10) => {
    setloading(true);
    const url = BACKEND_URL + '/user'
    const params = {
      sortOrder: sortOrder,
      page: page,
      limit: limit
    }
    const data = await get(url, params)
    if (data && data?.success === true) {
      setusers(data?.data?.users)
      settotalusers(data?.data?.count)
      // dispatch(showSnackBar({ msg: "Get User Success", type: "success" }))
    } else {
      dispatch(showSnackBar({ msg: `Get User Fail ${data.exception_reason}`, type: "error" }))
    }
    resetStates()
    setloading(false);
  }


  const handleOpenDialog = (user) => {
    setDialogOpen(true);
    setselectedUser(user);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setselectedUser(null);
  };

  const handleConfirm = () => {
    deleteUser()
    fetchAllUsers()
    setDialogOpen(false);
    setselectedUser(null);
  };

  const deleteUser = async () => {
    setloading(true);
    const url = BACKEND_URL + '/user/' + selectedUser?._id
    const data = await remove(url)
    if (data && data?.success === true) {
      fetchAllUsers()
      dispatch(showSnackBar({ msg: "Delete User Success", type: "success" }))
    } else {
      dispatch(showSnackBar({ msg: `Delete User Fail ${data.exception_reason}`, type: "error" }))
    }
    setloading(false);
  }
  const handleChangePage = (page, pageSize) => {
    fetchAllUsers(false, page, 10)
    setCurrent(page);
  };

  const handleMasterCheckBoxChange = (e) => {
    let checked = e.target.checked
    if (checked) {
      let ele = document.getElementsByName('child_checkbox')
      for (let i = 0; i < ele.length; i++) {
        if (ele[i].type === 'checkbox')
          ele[i].checked = true;
      }
      setbulkselected(users)

    } else {
      let ele = document.getElementsByName('child_checkbox')
      for (var i = 0; i < ele.length; i++) {
        if (ele[i].type === 'checkbox')
          ele[i].checked = false;
      }
      resetStates()
    }
  }

  const handleCheckBoxChange = (e, item) => {
    let checked = e.target.checked
    if (checked) {
      setbulkselected([...bulkselected, item])
    } else {
      setbulkselected(bulkselected.filter(a => a._id !== item._id))
    }
  }

  const handleEdit = (user) => {
    settoggleNew("edit")
    setselectedUser(user)
    resetStates()
  }

  const handleNew = () => {
    settoggleNew("new")
    resetStates()
  }

  const handleBulkAction = async () => {
    let listOfIds = []
    for (let item of bulkselected) {
      listOfIds.push(item._id)
    }
    setloading(true);
    if (bulkaction === "delete") {
      const url = BACKEND_URL + '/user/bulk'
      console.log(listOfIds)
      let payload = {
        listOfIds: listOfIds,
        operation: 'delete'
      }
      const data = await post(url, payload)
      if (data && data?.success === true) {
        dispatch(showSnackBar({ msg: "Bulk Update Success", type: "success" }))
      } else {
        dispatch(showSnackBar({ msg: `Bulk Update Fail ${data.exception_reason}`, type: "error" }))
      }
      fetchAllUsers()
    } else if (bulkaction === "active") {
      const url = BACKEND_URL + '/user/bulk'
      let payload = {
        listOfIds: listOfIds,
        operation: 'update',
        updateData: {
          isActive: true
        }
      }
      const data = await post(url, payload)
      if (data && data?.success === true) {
        dispatch(showSnackBar({ msg: "Bulk Update Success", type: "success" }))
      } else {
        dispatch(showSnackBar({ msg: `Bulk Update Fail ${data.exception_reason}`, type: "error" }))
      }
      fetchAllUsers()

    } else if (bulkaction === "inactive") {
      const url = BACKEND_URL + '/user/bulk'
      let payload = {
        listOfIds: listOfIds,
        operation: 'update',
        updateData: {
          isActive: false
        }
      }
      const data = await post(url, payload)
      if (data && data?.success === true) {
        dispatch(showSnackBar({ msg: "Bulk Update Success", type: "success" }))
      } else {
        dispatch(showSnackBar({ msg: `Bulk Update Fail ${data.exception_reason}`, type: "error" }))
      }
      fetchAllUsers()
    }
    setloading(false);
  }

  const onSearch = async (value, _e, info) => {
    setsearchvalue(value)
    setloading(true);
    const url = BACKEND_URL + '/user/search'
    const params = {
      page: 1,
      limit: 10,
      q: value
    }
    const data = await get(url, params)
    if (data && data?.success === true) {
      setusers(data?.data?.users)
      settotalusers(data?.data?.count)
      dispatch(showSnackBar({ msg: "Get User Success", type: "success" }))
    } else {
      dispatch(showSnackBar({ msg: `Get User Fail ${data.exception_reason}`, type: "error" }))
    }
    resetStates()
    setloading(false);
  }


  return (
    <ContentBox>
      <TopSpinner open={loading} message={"Please Wait ..."} />
      <ConfirmDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirm}
        title="Delete User"
        content="Are you sure you want to perform this action?"
      />
      {
        toggleNew === "new" ?
          <div>
            <div className="d-flex flex-row justify-content-between mb-4">
              <h5 className="modal-title fw-bolder">Create User</h5>
              <button type="button" class="btn-close" data-mdb-dismiss="modal" aria-label="Close" onClick={() => settoggleNew("list")}></button>
            </div>
            <CreateForm setloading={setloading} fetchAllUsers={fetchAllUsers} />
          </div> :
          toggleNew === "edit" ?
            <div>
              <div className="d-flex flex-row justify-content-between mb-4">
                <h5 class="modal-title fw-bolder" id="exampleModalLabel">Edit User</h5>
                <button type="button" class="btn-close" data-mdb-dismiss="modal" aria-label="Close" onClick={() => settoggleNew("list")}></button>
              </div>
              <EditForm user={selectedUser} setloading={setloading} fetchAllUsers={fetchAllUsers} />
            </div>
            :
            <div class="card mb-3">
              <div class="card-header">
                <div class="row align-items-center justify-content-between">
                  <div class="col-2 col-sm-auto d-flex align-items-center pr-0">
                    <h5 class="fs-0 mb-0 text-nowrap py-2 py-xl-0 me-2 fw-bolder">User</h5>
                  </div>
                  <div class="col-4 col-sm-auto d-flex align-items-center pr-0">
                    <Search
                      placeholder="input search text"
                      onSearch={onSearch}
                      style={{
                        width: 200,
                      }}
                    />
                  </div>
                  <div class="col-6 col-sm-auto ml-auto text-right pl-0">
                    {
                      bulkselected.length > 0 ? <div class="d-flex" id="orders-actions">
                        <div class="input-group input-group-sm mb-2">
                          <select class="custom-select cus" aria-label="Bulk actions" onChange={(e) => setbulkaction(e.target.value)}>
                            <option selected="">Bulk actions</option>
                            <option value="delete">Delete</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                          <button class="btn btn-sm bg-blue ml-2" type="button" onClick={handleBulkAction}>Apply</button>
                        </div>
                      </div> : <></>
                    }
                    <div id="dashboard-actions">
                      <button class="btn bg-blue btn-sm" type="button" onClick={() => handleNew()}>
                        <span class="fas fa-plus" data-fa-transform="shrink-3 down-2"></span>
                        <span class="d-none d-sm-inline-block ml-1">New</span>
                      </button>
                      <button class="btn bg-warning btn-sm mx-2" type="button">
                        <span class="fas fa-filter" data-fa-transform="shrink-3 down-2"></span>
                        <span class="d-none d-sm-inline-block ml-1">Filter</span>
                      </button>
                      <button class="btn bg-green btn-sm" type="button">
                        <span class="fas fa-external-link-alt" data-fa-transform="shrink-3 down-2"></span>
                        <span class="d-none d-sm-inline-block ml-1">Export</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card-body p-0">
                <div class="falcon-data-table">
                  <table class="table table-sm mb-0 table-striped table-dashboard fs--1 data-table border-bottom border-200" data-options='{"searching":false,"responsive":false,"info":false,"lengthChange":false,"sWrapper":"falcon-data-table-wrapper","dom":"<&#39;row mx-1&#39;<&#39;col-sm-12 col-md-6&#39;l><&#39;col-sm-12 col-md-6&#39;f>><&#39;table-responsive&#39;tr><&#39;row no-gutters px-1 py-3 align-items-center justify-content-center&#39;<&#39;col-auto&#39;p>>","language":{"paginate":{"next":"<span class=\"fas fa-chevron-right\"></span>","previous":"<span class=\"fas fa-chevron-left\"></span>"}}}'>
                    <thead class="bg-200 text-900">
                      <tr>
                        <th class="align-middle no-sort">
                          <div class="custom-control custom-checkbox">
                            <input className="form-check-input" type="checkbox" value="" name='master_checkbox' id="flexCheckDefault" onChange={(e) => handleMasterCheckBoxChange(e)} />
                          </div>
                        </th>
                        <th class="align-middle sort">Name</th>
                        <th class="align-middle sort">Email</th>
                        <th class="align-middle sort">Phone</th>
                        <th class="align-middle sort">Joined</th>
                        <th class="align-middle sort">Role</th>
                        <th class="align-middle sort">Active</th>
                        <th class="align-middle sort">Verified</th>
                        <th class="no-sort">Actions</th>
                      </tr>
                    </thead>
                    <tbody id="users">
                      {
                        users.map((item, index) => (
                          <tr class="btn-reveal-trigger">
                            <td class="py-2 align-middle">
                              <div class="custom-control custom-checkbox">
                                <input className="form-check-input" type="checkbox" value="" name='child_checkbox' id="flexCheckDefault" onChange={(e) => handleCheckBoxChange(e, item)} />
                              </div>
                            </td>
                            <td class="py-2 align-middle white-space-nowrap customer-name-column"><a href="../pages/customer-details.html">
                              <div class="media d-flex align-items-center">
                                <div class="avatar avatar-xl mr-2">
                                  <div class="avatar-name rounded-circle"><span><img src={item.avatar}></img></span></div>
                                </div>
                                <div class="media-body">
                                  <h5 class="mb-0 fs--1">{item.firstName}</h5>
                                </div>
                              </div>
                            </a></td>
                            <td class="py-2 align-middle"><a href={`mailto:${item.email}`}>{item.email}</a></td>
                            <td class="py-2 align-middle white-space-nowrap"> <a href="tel:2012001851">(91) {item.phoneNumber} </a></td>
                            <td class="py-2 align-middle">30/03/2018</td>
                            <td class="py-2 align-middle">{item.role}</td>
                            <td class="py-2 align-middle">
                              {item.active ? <span class="badge badge-success rounded-pill d-inline">Active</span> :
                                <span class="badge badge-danger rounded-pill d-inline">Not Active</span>
                              }</td>
                            <td class="py-2 align-middle">
                              {
                                item.verified ? <span class="badge badge-success rounded-pill d-inline">Verified</span> :
                                  <span class="badge badge-danger rounded-pill d-inline">Not Verified</span>
                              }
                            </td>
                            <td class="py-2 align-middle white-space-nowrap">
                              <div class="dropdown">
                                <button
                                  class="btn btn-link btn-sm btn-reveal dropdown-toggle"
                                  type="button"
                                  id={`dropdownbtn_${index}`}
                                  data-mdb-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  <span class="fas fa-ellipsis-h fs--1"></span>
                                </button>
                                <ul class="dropdown-menu" aria-labelledby={`dropdownbtn_${index}`}>
                                  <li><a class="dropdown-item" href="#" onClick={() => handleEdit(item)}>Edit</a></li>
                                  <li><a class="dropdown-item" href="#" onClick={() => handleOpenDialog(item)}>Delete</a></li>
                                </ul>
                              </div>
                            </td>
                          </tr>
                        ))
                      }

                    </tbody>
                  </table>
                  <div className='text-center p-3'>
                    <Pagination
                      total={totalusers}
                      showTotal={(total) => `Total ${total} items`}
                      defaultPageSize={10}
                      defaultCurrent={1}
                      onChange={handleChangePage}
                    />
                  </div>
                </div>
              </div>
            </div>
      }
    </ContentBox>
  )
}

export default User