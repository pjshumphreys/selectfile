#include <stdio.h>      /* printf, fopen */
#include <stdlib.h>     /* exit, EXIT_FAILURE */
#include <time.h>
#include <errno.h>
#include <string.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <stdarg.h> 
#include <unistd.h>     // getcwd
#include <dirent.h>     // opendir, readdir, closedir

#define TRUE 1
#define FALSE 0

struct folder {
  char* path;
  int depth;
  struct folder* next;
};

struct fileEntry {
  struct fileEntry *left;
  struct fileEntry *right;
  struct fileEntry *parent;
  char *name;
  int isFolder;
  int depth;
  time_t modified;
  off_t size;
};

void testCallBack(char *name, int isFolder, time_t modified, off_t size) {
  printf("%s\n", name);
}

//free memory and set the pointer to NULL. this function should hopefully get inlined
void strFree(char ** str) {
  free(*str);
  *str = NULL;
}

int starts_with(const char *string, const char *prefix) {
  while(*prefix) {
      if(*prefix++ != *string++) {
        return FALSE;
      }
  }

  return TRUE;
}

int statdir(
    char * root_path,
    char * dir,
    struct dirent * direp,
    char** fullPath,
    struct stat *buf
  ) {

  char* temp;
  char* link_path;
  int retval;

  temp = (char*)malloc(strlen(dir)+strlen(direp->d_name)+2);
  sprintf(temp, "%s/%s", dir, direp->d_name);
  *fullPath = temp;

  retval = lstat(temp, buf);

  if(retval != 0) {
    strFree(fullPath);
    return retval;
  }

  if(S_ISLNK(buf->st_mode)) {
    retval = stat(temp, buf);

    if(retval != 0) {
      retval = lstat(temp, buf);
    }
    else if(S_ISDIR(buf->st_mode)) {
      link_path = realpath(temp, NULL);
           
      if(
          starts_with(root_path, link_path) ||
          starts_with(link_path, root_path)
        ) {
        retval = lstat(temp, buf);
      }

      free(link_path);
    }
  }
  
  return retval;
}

void insert(
    struct fileEntry ** root,
    char * name,
    int isFolder,
    int depth,
    time_t modified,
    off_t size,
    int sortBy,
    int sortDescending
  ) {

  int comparison;
  struct fileEntry * currentNode;
  struct fileEntry * newNode;
  int state = 1;

  if(root == NULL) {
    //Huh? no memory location was specified to hold the tree?
    //Just exit and let the author of the calling function figure out their mistake
    return;
  }

  if((newNode = malloc(sizeof(struct fileEntry))) == NULL) {
    return;
  }

  newNode->parent = NULL;
  newNode->left = NULL;
  newNode->right = NULL;
  newNode->name = name;
  newNode->isFolder = isFolder,
  newNode->depth = depth,
  newNode->modified = modified,
  newNode->size = size;

  if(*root == NULL) {
    //No entries have been inserted at all.
    //Just insert the data into a new node
    *root = newNode;
    return;
  }
  else {
    //navigate down the tree, and insert the new data into the correct place within it

    //start at the top
    currentNode = *root;

    for( ; ; ) {
      comparison = 0;

      do {
        switch(state) {
          case 1: {
            if(currentNode->depth != depth) {
              comparison = currentNode->depth > depth?1:-1;
            }
          } break;

          case 2: {
            if(currentNode->isFolder && !isFolder) {
              comparison = sortDescending?-1:1;
            }
          } break;

          case 3: {
            if(!(currentNode->isFolder) && isFolder) {
              comparison = sortDescending?1:-1;
            }
          } break;

          case 4: {
            switch(sortBy) {
              case 2: //date
                if(currentNode->modified != modified) {
                  if(currentNode->modified > modified) {
                    comparison = -1;
                  }
                  else {
                    comparison = 1;
                  }
                }
              break;

              case 3: //size
                if(currentNode->size != size) {
                  if(currentNode->size > size) {
                    comparison = -1;
                  }
                  else {
                    comparison = 1;
                  }
                }
              break;
            }
          }

          case 5: {
            comparison = strcmp(currentNode->name, name);
          }
        }
        
        state++;
      } while(comparison == 0 && state != 6);

      if(sortDescending) {
        comparison = -comparison;
      }

      if(comparison < 1) {
        if(currentNode->left == NULL) {
          newNode->parent = currentNode;
          currentNode->left = newNode;
          return;
        }
        else {
          currentNode = currentNode->left;
        }
      }
      else {
        if(currentNode->right == NULL) {
          newNode->parent = currentNode;
          currentNode->right = newNode;
          return;
        }
        else {
          currentNode = currentNode->right;
        }
      }
    }
  }
}

void walkAndCleanup(
    struct fileEntry **root,
    int callback
  ) {

  struct fileEntry *currentNode;
  struct fileEntry *parentNode;
  
  void (*addListEntryPtr)(char *, int, time_t, off_t) = (void (*)(char *, int, time_t, off_t))callback;

  if(root == NULL || *root == NULL) {
    return;
  }

  currentNode = *root;

  for( ; ; ) {
    if(currentNode->left) {
      currentNode = currentNode->left;
      continue;
    }

    if((currentNode->name) != NULL) {
      addListEntryPtr(currentNode->name, currentNode->isFolder, currentNode->modified, currentNode->size);
      strFree(&(currentNode->name));
    }

    if(currentNode->right) {
      currentNode = currentNode->right;
      continue;
    }

    parentNode = currentNode->parent;
    
    if(parentNode != NULL) {
      if(parentNode->left == currentNode) {
        currentNode = parentNode;
        free(currentNode->left);
        currentNode->left = NULL;
      }
      else {
        currentNode = parentNode;
        free(currentNode->right);
        currentNode->right = NULL;
      }
    }
    else {
      free(currentNode);
      *root = NULL;
      return;
    }
  }
}

int main(int argc, char *argv[]) {
  DIR *dirp;
  struct dirent *direntp;
  struct stat buf;

  char* rootPath = realpath(".", NULL);

  char* str = NULL;
  char* fullPath = NULL;
  char* escapedPath = NULL;

  struct folder * current = NULL;
  struct folder * last = NULL;
  struct folder * temp = NULL;

  struct fileEntry *root = NULL;
  int sortBy = 1;
  int sortDescending = 0;

  current = last = (struct folder *)malloc(sizeof(struct folder));
  current->next = NULL;
  current->path = rootPath;
  current->depth = 0;
  
  dirp = opendir(current->path);

  if(dirp != NULL) {
    for( ; ; ) {
      direntp = readdir(dirp);
      
      if(direntp == NULL) {
        closedir(dirp);

        do {
          if(current->next != NULL) {
            temp = current->next;
            free(current);
            current = temp;
            
            dirp = opendir(current->path);
          }
          else {
            dirp = NULL;
            break;
          }
        } while(dirp == NULL);

        if(dirp) {
          continue;
        }
        else {
          free(current);
          break;
        }
      }

      if(strcmp(direntp->d_name, ".") == 0 || strcmp(direntp->d_name, "..") == 0) {
        continue;
      }

      if(statdir(rootPath, current->path, direntp, &fullPath, &buf) == 0) {
        if(S_ISDIR(buf.st_mode)) {
          temp = (struct folder *)malloc(sizeof(struct folder));
          temp->path = fullPath;
          temp->next = NULL;
          temp->depth = current->depth + 1;
          last->next = temp;
          last = temp;
          
          insert(
              &root,
              fullPath,
              1,
              temp->depth,
              buf.st_mtime,
              0,
              sortBy,
              sortDescending
            );
        }
        else if(S_ISREG(buf.st_mode)) {
          insert(
              &root,
              fullPath,
              0,
              current->depth + 1,
              buf.st_mtime,
              buf.st_size,
              sortBy,
              sortDescending
            );
        }
        else {
          strFree(&fullPath);
        }
      }
    }
  }

  walkAndCleanup(&root, (long)&testCallBack);

  return EXIT_SUCCESS;
}
