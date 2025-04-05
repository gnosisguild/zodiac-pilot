import {
  SkeletonText,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@zodiac/ui'

export const SkeletonFlowTable = () => (
  <Table>
    <TableHead>
      <TableRow>
        <TableHeader>
          <SkeletonText />
        </TableHeader>
        <TableHeader>
          <SkeletonText />
        </TableHeader>
        <TableHeader>
          <SkeletonText />
        </TableHeader>
      </TableRow>
    </TableHead>
    <TableBody>
      <TableRow>
        <TableCell>
          <SkeletonText />
        </TableCell>
        <TableCell>
          <SkeletonText />
        </TableCell>
        <TableCell>
          <SkeletonText />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          <SkeletonText />
        </TableCell>
        <TableCell>
          <SkeletonText />
        </TableCell>
        <TableCell>
          <SkeletonText />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          <SkeletonText />
        </TableCell>
        <TableCell>
          <SkeletonText />
        </TableCell>
        <TableCell>
          <SkeletonText />
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
)
